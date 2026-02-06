"""
Pytest configuration and fixtures for API testing.
"""
import asyncio
from typing import AsyncGenerator
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.main import app
from app.database.connection import get_db
from app.models.base import Base
from app.models.agent import Agent
from app.models.session import Session
from app.models.message import Message, MessageType, MessageRole

# Test database URL (in-memory SQLite)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create test engine
test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)

# Create test session factory
test_async_session_maker = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create a fresh test database session for each test."""
    # Create all tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Provide session
    async with test_async_session_maker() as session:
        yield session

    # Drop all tables after test
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create a test client with overridden database dependency."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        yield client

    app.dependency_overrides.clear()


# ============================================================================
# SAMPLE DATA FIXTURES
# ============================================================================

@pytest_asyncio.fixture
async def sample_agent(db_session: AsyncSession) -> Agent:
    """Create a sample agent for testing."""
    agent = Agent(
        id=str(uuid4()),
        name="Test Agent",
        system_prompt="You are a helpful test assistant.",
    )
    db_session.add(agent)
    await db_session.commit()
    await db_session.refresh(agent)
    return agent


@pytest_asyncio.fixture
async def sample_session(db_session: AsyncSession, sample_agent: Agent) -> Session:
    """Create a sample session for testing."""
    session = Session(
        id=str(uuid4()),
        agent_id=sample_agent.id,
        title="Test Session",
    )
    db_session.add(session)
    await db_session.commit()
    await db_session.refresh(session)
    return session


@pytest_asyncio.fixture
async def sample_messages(db_session: AsyncSession, sample_session: Session) -> list[Message]:
    """Create sample messages for testing pagination."""
    messages = []
    for i in range(60):  # More than default limit of 50
        msg = Message(
            id=str(uuid4()),
            session_id=sample_session.id,
            role=MessageRole.USER.value if i % 2 == 0 else MessageRole.ASSISTANT.value,
            content=f"Test message {i + 1}",
            message_type=MessageType.TEXT.value,
        )
        db_session.add(msg)
        messages.append(msg)

    await db_session.commit()
    for msg in messages:
        await db_session.refresh(msg)

    return messages


@pytest_asyncio.fixture
async def multiple_agents(db_session: AsyncSession) -> list[Agent]:
    """Create multiple agents for testing list endpoint."""
    agents = []
    for i in range(3):
        agent = Agent(
            id=str(uuid4()),
            name=f"Agent {i + 1}",
            system_prompt=f"System prompt for agent {i + 1}",
        )
        db_session.add(agent)
        agents.append(agent)

    await db_session.commit()
    for agent in agents:
        await db_session.refresh(agent)

    return agents


@pytest_asyncio.fixture
async def agent_with_sessions(db_session: AsyncSession) -> tuple[Agent, list[Session]]:
    """Create an agent with multiple sessions for testing cascade delete."""
    agent = Agent(
        id=str(uuid4()),
        name="Agent with Sessions",
        system_prompt="Test prompt",
    )
    db_session.add(agent)
    await db_session.flush()

    sessions = []
    for i in range(3):
        session = Session(
            id=str(uuid4()),
            agent_id=agent.id,
            title=f"Session {i + 1}",
        )
        db_session.add(session)
        sessions.append(session)

    await db_session.commit()
    await db_session.refresh(agent)
    for session in sessions:
        await db_session.refresh(session)

    return agent, sessions
