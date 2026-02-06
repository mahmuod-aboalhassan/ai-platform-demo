from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AgentCreate(BaseModel):
    """Request schema for creating an agent."""

    name: str = Field(..., min_length=1, max_length=100, examples=["Customer Support Bot"])
    system_prompt: str = Field(
        ...,
        min_length=1,
        examples=["You are a helpful customer support agent. Be polite and concise."],
    )


class AgentUpdate(BaseModel):
    """Request schema for updating an agent."""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    system_prompt: Optional[str] = Field(None, min_length=1)


class AgentResponse(BaseModel):
    """Response schema for an agent."""

    id: str
    name: str
    system_prompt: str
    created_at: datetime
    updated_at: datetime
    session_count: int = 0

    class Config:
        from_attributes = True


class AgentListResponse(BaseModel):
    """Response schema for list of agents."""

    agents: list[AgentResponse]
    total: int


class PromptRefineRequest(BaseModel):
    """Request schema for refining a prompt from a simple description."""

    description: str = Field(
        ...,
        min_length=5,
        max_length=1000,
        examples=["A friendly customer support agent for a tech company"],
    )


class PromptRefineResponse(BaseModel):
    """Response schema for refined prompt."""

    system_prompt: str

