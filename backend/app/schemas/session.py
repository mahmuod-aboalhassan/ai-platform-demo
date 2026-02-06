from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

from pydantic import BaseModel, Field

if TYPE_CHECKING:
    from app.schemas.message import MessageResponse
    from app.schemas.agent import AgentResponse


class SessionCreate(BaseModel):
    """Request schema for creating a session."""

    title: Optional[str] = Field(None, max_length=200)


class SessionResponse(BaseModel):
    """Response schema for a session."""

    id: str
    agent_id: str
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    class Config:
        from_attributes = True


class SessionListResponse(BaseModel):
    """Response schema for list of sessions."""

    sessions: list[SessionResponse]
    total: int


class SessionDetailResponse(SessionResponse):
    """Response schema for session with messages."""

    messages: List["MessageResponse"] = []
    agent: Optional["AgentResponse"] = None


# Update forward references
from app.schemas.message import MessageResponse
from app.schemas.agent import AgentResponse

SessionDetailResponse.model_rebuild()
