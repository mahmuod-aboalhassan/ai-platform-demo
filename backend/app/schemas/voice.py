from pydantic import BaseModel

from app.schemas.message import MessageResponse


class VoiceMessageResponse(BaseModel):
    """Response schema for voice message."""

    user_message: MessageResponse
    assistant_message: MessageResponse
