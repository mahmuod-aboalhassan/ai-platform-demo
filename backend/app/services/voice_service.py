import os
import logging
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.integrations.openai_client import openai_client
from app.models.agent import Agent
from app.models.session import Session
from app.models.message import Message, MessageRole, MessageType
from app.schemas.message import MessageResponse
from app.schemas.voice import VoiceMessageResponse

logger = logging.getLogger(__name__)

# Fallback messages
FALLBACK_MESSAGES = {
    "stt_failed": "I couldn't understand the audio. Please try speaking more clearly.",
    "tts_failed": "I couldn't generate audio for this response, but here's my text reply.",
    "default": "I apologize, I'm having trouble responding right now. Please try again.",
}


class VoiceService:
    """Service for handling voice operations."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.openai = openai_client

    async def _save_audio_file(self, content: bytes, folder: str, extension: str) -> str:
        """Save audio file to disk and return the path."""
        # Ensure directory exists
        dir_path = Path(f"audio_files/{folder}")
        dir_path.mkdir(parents=True, exist_ok=True)

        # Generate unique filename
        filename = f"{uuid4()}.{extension}"
        file_path = dir_path / filename

        # Write file
        with open(file_path, "wb") as f:
            f.write(content)

        return f"/api/audio/{folder}/{filename}"

    async def _save_message(
        self,
        session_id: str,
        role: str,
        content: str,
        message_type: str = MessageType.VOICE.value,
        audio_url: str = None,
        tts_audio_url: str = None,
    ) -> Message:
        """Save a message to the database."""
        message = Message(
            session_id=session_id,
            role=role,
            content=content,
            message_type=message_type,
            audio_url=audio_url,
            tts_audio_url=tts_audio_url,
        )
        self.db.add(message)
        await self.db.flush()
        await self.db.refresh(message)
        return message

    async def _get_conversation_history(self, session_id: str, limit: int = 20):
        """Get conversation history for context."""
        stmt = (
            select(Message)
            .where(Message.session_id == session_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        messages = list(reversed(result.scalars().all()))
        return [{"role": m.role, "content": m.content} for m in messages]

    async def _get_agent_for_session(self, session_id: str) -> Agent:
        """Get the agent associated with a session."""
        stmt = (
            select(Agent)
            .join(Session, Session.agent_id == Agent.id)
            .where(Session.id == session_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def _update_session_title(self, session_id: str, first_message: str) -> None:
        """Auto-generate session title from first message."""
        stmt = select(Session).where(Session.id == session_id)
        result = await self.db.execute(stmt)
        session = result.scalar_one()

        if session.title is None:
            title = first_message[:100]
            if len(first_message) > 100:
                title = title[:97] + "..."
            session.title = title
            await self.db.flush()

    def _message_to_response(self, message: Message) -> MessageResponse:
        """Convert Message model to MessageResponse schema."""
        return MessageResponse(
            id=message.id,
            session_id=message.session_id,
            role=message.role,
            content=message.content,
            message_type=message.message_type,
            audio_url=message.audio_url,
            tts_audio_url=message.tts_audio_url,
            created_at=message.created_at,
        )

    async def process_voice_message(
        self,
        session_id: str,
        audio_file: UploadFile,
        audio_content: bytes,
    ) -> VoiceMessageResponse:
        """
        Process a voice message:
        1. Save uploaded audio file
        2. Transcribe with Whisper (STT)
        3. Get chat response (non-streaming for voice)
        4. Generate TTS audio
        5. Save TTS file
        6. Save messages to DB
        7. Return response with audio URLs
        """
        # 1. Save user audio file
        extension = "webm" if "webm" in (audio_file.content_type or "") else "mp3"
        audio_url = await self._save_audio_file(audio_content, "uploads", extension)

        # Get the actual file path for transcription
        audio_path = Path(f"audio_files/uploads/{audio_url.split('/')[-1]}")

        try:
            # 2. Transcribe with Whisper
            transcript = await self.openai.speech_to_text(audio_path)
        except Exception as e:
            logger.error(f"STT failed for session {session_id}: {type(e).__name__}: {str(e)}", exc_info=True)
            # STT failed - save error message
            user_msg = await self._save_message(
                session_id=session_id,
                role=MessageRole.USER.value,
                content="[Audio message - transcription failed]",
                audio_url=audio_url,
            )
            ai_msg = await self._save_message(
                session_id=session_id,
                role=MessageRole.ASSISTANT.value,
                content=FALLBACK_MESSAGES["stt_failed"],
            )
            return VoiceMessageResponse(
                user_message=self._message_to_response(user_msg),
                assistant_message=self._message_to_response(ai_msg),
            )

        # Update session title if first message
        await self._update_session_title(session_id, transcript)

        try:
            # 3. Get AI response (non-streaming)
            history = await self._get_conversation_history(session_id)
            agent = await self._get_agent_for_session(session_id)

            ai_response = await self.openai.chat_completion(
                system_prompt=agent.system_prompt,
                messages=history + [{"role": "user", "content": transcript}],
            )
        except Exception as e:
            logger.error(f"Chat completion failed for session {session_id}: {type(e).__name__}: {str(e)}", exc_info=True)
            # Chat failed
            user_msg = await self._save_message(
                session_id=session_id,
                role=MessageRole.USER.value,
                content=transcript,
                audio_url=audio_url,
            )
            ai_msg = await self._save_message(
                session_id=session_id,
                role=MessageRole.ASSISTANT.value,
                content=FALLBACK_MESSAGES["default"],
            )
            return VoiceMessageResponse(
                user_message=self._message_to_response(user_msg),
                assistant_message=self._message_to_response(ai_msg),
            )

        try:
            # 4. Generate TTS audio
            tts_audio = await self.openai.text_to_speech(ai_response)

            # 5. Save TTS audio file
            tts_url = await self._save_audio_file(tts_audio, "tts", "mp3")
        except Exception as e:
            logger.error(f"TTS failed for session {session_id}: {type(e).__name__}: {str(e)}", exc_info=True)
            # TTS failed - return text response without audio
            tts_url = None

        # 6. Save messages to database
        user_msg = await self._save_message(
            session_id=session_id,
            role=MessageRole.USER.value,
            content=transcript,
            audio_url=audio_url,
        )

        ai_msg = await self._save_message(
            session_id=session_id,
            role=MessageRole.ASSISTANT.value,
            content=ai_response,
            tts_audio_url=tts_url,
        )

        # 7. Return response
        return VoiceMessageResponse(
            user_message=self._message_to_response(user_msg),
            assistant_message=self._message_to_response(ai_msg),
        )
