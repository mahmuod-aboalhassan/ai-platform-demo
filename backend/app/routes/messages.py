import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.models.session import Session
from app.models.message import Message, MessageRole, MessageType
from app.schemas.message import MessageCreate, MessageResponse, MessageListResponse

router = APIRouter()


@router.get("/sessions/{session_id}/messages", response_model=MessageListResponse)
async def list_messages(
    session_id: str,
    limit: int = Query(default=50, ge=1, le=100),
    before: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> MessageListResponse:
    """Get paginated messages for a session."""
    # Verify session exists
    session_stmt = select(Session).where(Session.id == session_id)
    session_result = await db.execute(session_stmt)
    if not session_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    # Get total count
    count_stmt = select(func.count(Message.id)).where(Message.session_id == session_id)
    count_result = await db.execute(count_stmt)
    total_count = count_result.scalar() or 0

    # Build query for messages
    stmt = select(Message).where(Message.session_id == session_id)

    if before:
        # Get the message to use as cursor
        cursor_stmt = select(Message).where(Message.id == before)
        cursor_result = await db.execute(cursor_stmt)
        cursor_message = cursor_result.scalar_one_or_none()
        if cursor_message:
            stmt = stmt.where(Message.created_at < cursor_message.created_at)

    stmt = stmt.order_by(Message.created_at.desc()).limit(limit + 1)

    result = await db.execute(stmt)
    messages = list(result.scalars().all())

    # Check if there are more messages
    has_more = len(messages) > limit
    if has_more:
        messages = messages[:limit]

    # Reverse to get chronological order
    messages = list(reversed(messages))

    return MessageListResponse(
        messages=[
            MessageResponse(
                id=m.id,
                session_id=m.session_id,
                role=m.role,
                content=m.content,
                message_type=m.message_type,
                audio_url=m.audio_url,
                tts_audio_url=m.tts_audio_url,
                created_at=m.created_at,
            )
            for m in messages
        ],
        has_more=has_more,
        total_count=total_count,
    )


@router.post("/sessions/{session_id}/messages")
async def send_message(
    session_id: str,
    message_data: MessageCreate,
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """Send a text message and get streaming response via SSE."""
    from app.services.chat_service import ChatService

    # Verify session exists and get agent
    session_stmt = select(Session).where(Session.id == session_id)
    session_result = await db.execute(session_stmt)
    session = session_result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    chat_service = ChatService(db)

    return StreamingResponse(
        chat_service.send_message_stream(session_id, message_data.content),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
