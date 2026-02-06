from datetime import datetime
from enum import Enum
from typing import Optional, List

from pydantic import BaseModel, Field


class MessageTypeEnum(str, Enum):
    """Type of message."""
    TEXT = "text"
    VOICE = "voice"


class MessageRoleEnum(str, Enum):
    """Role of message sender."""
    USER = "user"
    ASSISTANT = "assistant"


class MessageCreate(BaseModel):
    """Request schema for sending a text message."""

    content: str = Field(..., min_length=1, max_length=10000)


class MessageResponse(BaseModel):
    """Response schema for a message."""

    id: str
    session_id: str
    role: MessageRoleEnum
    content: str
    message_type: MessageTypeEnum
    audio_url: Optional[str] = None
    tts_audio_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    """Response schema for paginated messages."""

    messages: List[MessageResponse]
    has_more: bool
    total_count: int


class MessageQueryParams(BaseModel):
    """Query parameters for message pagination."""

    limit: int = Field(default=50, ge=1, le=100)
    before: Optional[str] = None  # Cursor-based pagination
