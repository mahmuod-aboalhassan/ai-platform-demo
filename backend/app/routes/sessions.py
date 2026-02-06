from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.models.agent import Agent
from app.models.session import Session
from app.models.message import Message
from app.schemas.session import (
    SessionCreate,
    SessionResponse,
    SessionListResponse,
    SessionDetailResponse,
)
from app.schemas.agent import AgentResponse
from app.schemas.message import MessageResponse

router = APIRouter()


def session_to_response(session: Session, message_count: int = 0) -> SessionResponse:
    """Convert Session model to SessionResponse schema."""
    return SessionResponse(
        id=session.id,
        agent_id=session.agent_id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=message_count,
    )


@router.get("/agents/{agent_id}/sessions", response_model=SessionListResponse)
async def list_sessions(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
) -> SessionListResponse:
    """List all sessions for an agent."""
    # Verify agent exists
    agent_stmt = select(Agent).where(Agent.id == agent_id)
    agent_result = await db.execute(agent_stmt)
    if not agent_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    # Get sessions with message counts
    stmt = (
        select(Session, func.count(Message.id).label("message_count"))
        .outerjoin(Message, Session.id == Message.session_id)
        .where(Session.agent_id == agent_id)
        .group_by(Session.id)
        .order_by(Session.updated_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()

    sessions = [session_to_response(row[0], row[1]) for row in rows]
    return SessionListResponse(sessions=sessions, total=len(sessions))


@router.post(
    "/agents/{agent_id}/sessions",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_session(
    agent_id: str,
    session_data: SessionCreate,
    db: AsyncSession = Depends(get_db),
) -> SessionResponse:
    """Create a new session for an agent."""
    # Verify agent exists
    agent_stmt = select(Agent).where(Agent.id == agent_id)
    agent_result = await db.execute(agent_stmt)
    if not agent_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    session = Session(
        agent_id=agent_id,
        title=session_data.title,
    )
    db.add(session)
    await db.flush()
    await db.refresh(session)
    return session_to_response(session)


@router.get("/sessions/{session_id}", response_model=SessionDetailResponse)
async def get_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> SessionDetailResponse:
    """Get a session with messages."""
    # Get session with message count
    stmt = (
        select(Session, func.count(Message.id).label("message_count"))
        .outerjoin(Message, Session.id == Message.session_id)
        .where(Session.id == session_id)
        .group_by(Session.id)
    )
    result = await db.execute(stmt)
    row = result.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    session = row[0]
    message_count = row[1]

    # Get agent
    agent_stmt = select(Agent).where(Agent.id == session.agent_id)
    agent_result = await db.execute(agent_stmt)
    agent = agent_result.scalar_one()

    # Get last 50 messages
    messages_stmt = (
        select(Message)
        .where(Message.session_id == session_id)
        .order_by(Message.created_at.desc())
        .limit(50)
    )
    messages_result = await db.execute(messages_stmt)
    messages = list(reversed(messages_result.scalars().all()))

    return SessionDetailResponse(
        id=session.id,
        agent_id=session.agent_id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=message_count,
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
        agent=AgentResponse(
            id=agent.id,
            name=agent.name,
            system_prompt=agent.system_prompt,
            created_at=agent.created_at,
            updated_at=agent.updated_at,
            session_count=0,  # Not needed here
        ),
    )


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a session."""
    stmt = select(Session).where(Session.id == session_id)
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    await db.delete(session)
    await db.commit()
