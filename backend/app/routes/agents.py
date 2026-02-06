from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.integrations.openai_client import openai_client
from app.models.agent import Agent
from app.models.session import Session
from app.schemas.agent import (
    AgentCreate,
    AgentUpdate,
    AgentResponse,
    AgentListResponse,
    PromptRefineRequest,
    PromptRefineResponse,
)

router = APIRouter()


def agent_to_response(agent: Agent, session_count: int = 0) -> AgentResponse:
    """Convert Agent model to AgentResponse schema."""
    return AgentResponse(
        id=agent.id,
        name=agent.name,
        system_prompt=agent.system_prompt,
        created_at=agent.created_at,
        updated_at=agent.updated_at,
        session_count=session_count,
    )


@router.get("/agents", response_model=AgentListResponse)
async def list_agents(db: AsyncSession = Depends(get_db)) -> AgentListResponse:
    """List all agents."""
    # Get agents with session counts
    stmt = (
        select(Agent, func.count(Session.id).label("session_count"))
        .outerjoin(Session, Agent.id == Session.agent_id)
        .group_by(Agent.id)
        .order_by(Agent.created_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()

    agents = [agent_to_response(row[0], row[1]) for row in rows]
    return AgentListResponse(agents=agents, total=len(agents))


@router.post("/agents", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    agent_data: AgentCreate,
    db: AsyncSession = Depends(get_db),
) -> AgentResponse:
    """Create a new agent."""
    agent = Agent(
        name=agent_data.name,
        system_prompt=agent_data.system_prompt,
    )
    db.add(agent)
    await db.flush()
    await db.refresh(agent)
    return agent_to_response(agent)


@router.get("/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
) -> AgentResponse:
    """Get an agent by ID."""
    stmt = (
        select(Agent, func.count(Session.id).label("session_count"))
        .outerjoin(Session, Agent.id == Session.agent_id)
        .where(Agent.id == agent_id)
        .group_by(Agent.id)
    )
    result = await db.execute(stmt)
    row = result.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    return agent_to_response(row[0], row[1])


@router.put("/agents/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    agent_data: AgentUpdate,
    db: AsyncSession = Depends(get_db),
) -> AgentResponse:
    """Update an agent."""
    stmt = select(Agent).where(Agent.id == agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    # Update fields if provided
    if agent_data.name is not None:
        agent.name = agent_data.name
    if agent_data.system_prompt is not None:
        agent.system_prompt = agent_data.system_prompt

    await db.flush()
    await db.refresh(agent)

    # Get session count
    count_stmt = select(func.count(Session.id)).where(Session.agent_id == agent_id)
    count_result = await db.execute(count_stmt)
    session_count = count_result.scalar() or 0

    return agent_to_response(agent, session_count)


@router.delete("/agents/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete an agent."""
    stmt = select(Agent).where(Agent.id == agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    await db.delete(agent)
    await db.commit()


# Prompt Engineering System Prompt
PROMPT_ENGINEER_SYSTEM = """You are an expert Prompt Engineer specializing in creating effective AI system prompts.

Your task is to take a simple user description and transform it into a well-structured, effective system prompt.

Follow these best practices:
1. **Role Definition**: Clearly define the AI's role and expertise
2. **Behavior Guidelines**: Specify how the AI should behave (tone, style, approach)
3. **Constraints**: Include relevant limitations and boundaries
4. **Response Format**: Suggest how responses should be structured when applicable
5. **Context Awareness**: Make the prompt context-aware for the intended use case

Output ONLY the refined system prompt, with no explanations or meta-commentary.
The prompt should be concise yet comprehensive, typically 100-300 words."""


@router.post("/agents/refine", response_model=PromptRefineResponse)
async def refine_prompt(
    request: PromptRefineRequest,
) -> PromptRefineResponse:
    """
    Transform a simple description into a well-engineered system prompt.
    
    Uses AI to apply prompt engineering best practices.
    """
    try:
        refined_prompt = await openai_client.chat_completion(
            system_prompt=PROMPT_ENGINEER_SYSTEM,
            messages=[{"role": "user", "content": f"Create a system prompt for an AI assistant with this purpose:\n\n{request.description}"}],
        )
        
        return PromptRefineResponse(system_prompt=refined_prompt.strip())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to refine prompt: {str(e)}",
        )

