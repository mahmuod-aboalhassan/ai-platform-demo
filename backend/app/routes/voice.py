import os
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database.connection import get_db
from app.models.session import Session
from app.schemas.voice import VoiceMessageResponse

router = APIRouter()


@router.post("/sessions/{session_id}/voice", response_model=VoiceMessageResponse)
async def send_voice_message(
    session_id: str,
    audio: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> VoiceMessageResponse:
    """Send a voice message and get AI response with TTS."""
    from app.services.voice_service import VoiceService

    # Verify session exists
    session_stmt = select(Session).where(Session.id == session_id)
    session_result = await db.execute(session_stmt)
    session = session_result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    # Validate file size
    content = await audio.read()
    if len(content) > settings.MAX_AUDIO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Audio file too large (max {settings.MAX_AUDIO_SIZE // (1024 * 1024)}MB)",
        )

    # Reset file position
    await audio.seek(0)

    voice_service = VoiceService(db)
    return await voice_service.process_voice_message(session_id, audio, content)


@router.get("/audio/{folder}/{filename}")
async def serve_audio(folder: str, filename: str) -> FileResponse:
    """Serve audio files."""
    if folder not in ["uploads", "tts"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio file not found",
        )

    file_path = Path(f"audio_files/{folder}/{filename}")

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio file not found",
        )

    # Determine content type
    content_type = "audio/webm" if filename.endswith(".webm") else "audio/mpeg"

    return FileResponse(
        path=file_path,
        media_type=content_type,
        headers={"Content-Disposition": "inline"},
    )
