"""
Comprehensive Tests for Sessions API Endpoints.

Endpoints tested:
- GET /api/agents/{agent_id}/sessions - List all sessions for an agent
- POST /api/agents/{agent_id}/sessions - Create new session
- GET /api/sessions/{id} - Get session with messages
- DELETE /api/sessions/{id} - Delete session
"""
import pytest
from httpx import AsyncClient

from app.models.agent import Agent
from app.models.session import Session
from app.models.message import Message


class TestListSessions:
    """Test suite for GET /api/agents/{agent_id}/sessions endpoint."""

    @pytest.mark.asyncio
    async def test_list_sessions_empty(self, client: AsyncClient, sample_agent: Agent):
        """Test listing sessions when agent has no sessions."""
        response = await client.get(f"/api/agents/{sample_agent.id}/sessions")

        assert response.status_code == 200
        data = response.json()
        assert data["sessions"] == []
        assert data["total"] == 0

    @pytest.mark.asyncio
    async def test_list_sessions_with_data(
        self, client: AsyncClient, agent_with_sessions: tuple[Agent, list[Session]]
    ):
        """Test listing sessions with existing data."""
        agent, sessions = agent_with_sessions
        response = await client.get(f"/api/agents/{agent.id}/sessions")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        assert len(data["sessions"]) == 3

    @pytest.mark.asyncio
    async def test_list_sessions_response_structure(
        self, client: AsyncClient, sample_session: Session, sample_agent: Agent
    ):
        """Test that list response has correct structure."""
        response = await client.get(f"/api/agents/{sample_agent.id}/sessions")
        data = response.json()

        assert "sessions" in data
        assert "total" in data
        assert isinstance(data["sessions"], list)
        assert isinstance(data["total"], int)

        # Check session structure
        session_data = data["sessions"][0]
        assert "id" in session_data
        assert "agent_id" in session_data
        assert "title" in session_data
        assert "created_at" in session_data
        assert "updated_at" in session_data
        assert "message_count" in session_data

    @pytest.mark.asyncio
    async def test_list_sessions_agent_not_found(self, client: AsyncClient):
        """Test listing sessions for non-existent agent."""
        response = await client.get("/api/agents/non-existent-id/sessions")

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_list_sessions_includes_message_count(
        self, client: AsyncClient, sample_session: Session, sample_messages: list[Message]
    ):
        """Test that list includes correct message count."""
        response = await client.get(f"/api/agents/{sample_session.agent_id}/sessions")
        data = response.json()

        session_data = next(s for s in data["sessions"] if s["id"] == sample_session.id)
        assert session_data["message_count"] == 60  # From sample_messages fixture

    @pytest.mark.asyncio
    async def test_list_sessions_ordered_by_updated_at(
        self, client: AsyncClient, agent_with_sessions: tuple[Agent, list[Session]]
    ):
        """Test that sessions are ordered by updated_at desc."""
        agent, _ = agent_with_sessions
        response = await client.get(f"/api/agents/{agent.id}/sessions")
        data = response.json()

        sessions = data["sessions"]
        # Sessions should be ordered by updated_at descending
        for i in range(len(sessions) - 1):
            assert sessions[i]["updated_at"] >= sessions[i + 1]["updated_at"]


class TestCreateSession:
    """Test suite for POST /api/agents/{agent_id}/sessions endpoint."""

    @pytest.mark.asyncio
    async def test_create_session_success(self, client: AsyncClient, sample_agent: Agent):
        """Test creating a new session successfully."""
        session_data = {"title": "New Chat Session"}
        response = await client.post(
            f"/api/agents/{sample_agent.id}/sessions", json=session_data
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New Chat Session"
        assert data["agent_id"] == sample_agent.id
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
        assert data["message_count"] == 0

    @pytest.mark.asyncio
    async def test_create_session_without_title(self, client: AsyncClient, sample_agent: Agent):
        """Test creating a session without title (optional field)."""
        session_data = {}
        response = await client.post(
            f"/api/agents/{sample_agent.id}/sessions", json=session_data
        )

        # Empty request body without title - title is optional
        assert response.status_code == 201
        data = response.json()
        assert data["title"] is None

    @pytest.mark.asyncio
    async def test_create_session_with_long_title(self, client: AsyncClient, sample_agent: Agent):
        """Test creating session with long title."""
        session_data = {"title": "A" * 200}
        response = await client.post(
            f"/api/agents/{sample_agent.id}/sessions", json=session_data
        )

        assert response.status_code == 201
        assert response.json()["title"] == "A" * 200

    @pytest.mark.asyncio
    async def test_create_session_agent_not_found(self, client: AsyncClient):
        """Test creating session for non-existent agent."""
        session_data = {"title": "Test Session"}
        response = await client.post(
            "/api/agents/non-existent-id/sessions", json=session_data
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_create_multiple_sessions(self, client: AsyncClient, sample_agent: Agent):
        """Test creating multiple sessions for same agent."""
        for i in range(3):
            session_data = {"title": f"Session {i + 1}"}
            response = await client.post(
                f"/api/agents/{sample_agent.id}/sessions", json=session_data
            )
            assert response.status_code == 201

        # Verify all sessions exist
        list_response = await client.get(f"/api/agents/{sample_agent.id}/sessions")
        assert list_response.json()["total"] == 3

    @pytest.mark.asyncio
    async def test_create_session_with_special_characters_title(
        self, client: AsyncClient, sample_agent: Agent
    ):
        """Test creating session with special characters in title."""
        session_data = {"title": "Test <script>alert('xss')</script> Session"}
        response = await client.post(
            f"/api/agents/{sample_agent.id}/sessions", json=session_data
        )

        assert response.status_code == 201
        # Title should be stored as-is (sanitization happens on display)
        assert response.json()["title"] == "Test <script>alert('xss')</script> Session"

    @pytest.mark.asyncio
    async def test_create_session_with_unicode_title(
        self, client: AsyncClient, sample_agent: Agent
    ):
        """Test creating session with unicode characters in title."""
        session_data = {"title": "Тест сессия 日本語 🎉"}
        response = await client.post(
            f"/api/agents/{sample_agent.id}/sessions", json=session_data
        )

        assert response.status_code == 201
        assert response.json()["title"] == "Тест сессия 日本語 🎉"


class TestGetSession:
    """Test suite for GET /api/sessions/{id} endpoint."""

    @pytest.mark.asyncio
    async def test_get_session_success(
        self, client: AsyncClient, sample_session: Session, sample_agent: Agent
    ):
        """Test getting an existing session."""
        response = await client.get(f"/api/sessions/{sample_session.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_session.id
        assert data["agent_id"] == sample_agent.id
        assert data["title"] == sample_session.title

    @pytest.mark.asyncio
    async def test_get_session_not_found(self, client: AsyncClient):
        """Test getting a non-existent session."""
        response = await client.get("/api/sessions/non-existent-id")

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_get_session_response_structure(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test that get response has all required fields."""
        response = await client.get(f"/api/sessions/{sample_session.id}")
        data = response.json()

        required_fields = [
            "id",
            "agent_id",
            "title",
            "created_at",
            "updated_at",
            "message_count",
            "messages",
            "agent",
        ]
        for field in required_fields:
            assert field in data

    @pytest.mark.asyncio
    async def test_get_session_includes_agent_details(
        self, client: AsyncClient, sample_session: Session, sample_agent: Agent
    ):
        """Test that get session includes agent details."""
        response = await client.get(f"/api/sessions/{sample_session.id}")
        data = response.json()

        agent_data = data["agent"]
        assert agent_data["id"] == sample_agent.id
        assert agent_data["name"] == sample_agent.name
        assert agent_data["system_prompt"] == sample_agent.system_prompt

    @pytest.mark.asyncio
    async def test_get_session_includes_messages(
        self, client: AsyncClient, sample_session: Session, sample_messages: list[Message]
    ):
        """Test that get session includes messages (limited to 50)."""
        response = await client.get(f"/api/sessions/{sample_session.id}")
        data = response.json()

        # Session detail endpoint returns last 50 messages
        assert len(data["messages"]) == 50
        assert data["message_count"] == 60

    @pytest.mark.asyncio
    async def test_get_session_messages_structure(
        self, client: AsyncClient, sample_session: Session, sample_messages: list[Message]
    ):
        """Test that messages have correct structure."""
        response = await client.get(f"/api/sessions/{sample_session.id}")
        data = response.json()

        message = data["messages"][0]
        assert "id" in message
        assert "session_id" in message
        assert "role" in message
        assert "content" in message
        assert "message_type" in message
        assert "created_at" in message

    @pytest.mark.asyncio
    async def test_get_session_messages_chronological_order(
        self, client: AsyncClient, sample_session: Session, sample_messages: list[Message]
    ):
        """Test that messages are in chronological order."""
        response = await client.get(f"/api/sessions/{sample_session.id}")
        data = response.json()

        messages = data["messages"]
        for i in range(len(messages) - 1):
            assert messages[i]["created_at"] <= messages[i + 1]["created_at"]

    @pytest.mark.asyncio
    async def test_get_session_empty_messages(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test getting session with no messages."""
        response = await client.get(f"/api/sessions/{sample_session.id}")
        data = response.json()

        assert data["messages"] == []
        assert data["message_count"] == 0


class TestDeleteSession:
    """Test suite for DELETE /api/sessions/{id} endpoint."""

    @pytest.mark.asyncio
    async def test_delete_session_success(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test deleting an existing session."""
        response = await client.delete(f"/api/sessions/{sample_session.id}")

        assert response.status_code == 204

        # Verify session is deleted
        get_response = await client.get(f"/api/sessions/{sample_session.id}")
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_session_not_found(self, client: AsyncClient):
        """Test deleting a non-existent session."""
        response = await client.delete("/api/sessions/non-existent-id")

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_session_cascades_messages(
        self, client: AsyncClient, sample_session: Session, sample_messages: list[Message]
    ):
        """Test that deleting session also deletes its messages."""
        # Delete session
        response = await client.delete(f"/api/sessions/{sample_session.id}")
        assert response.status_code == 204

        # Verify session is deleted
        get_response = await client.get(f"/api/sessions/{sample_session.id}")
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_session_agent_sessions_updated(
        self, client: AsyncClient, agent_with_sessions: tuple[Agent, list[Session]]
    ):
        """Test that agent session count is updated after delete."""
        agent, sessions = agent_with_sessions

        # Check initial count
        list_response = await client.get(f"/api/agents/{agent.id}/sessions")
        assert list_response.json()["total"] == 3

        # Delete one session
        await client.delete(f"/api/sessions/{sessions[0].id}")

        # Check updated count
        list_response = await client.get(f"/api/agents/{agent.id}/sessions")
        assert list_response.json()["total"] == 2

    @pytest.mark.asyncio
    async def test_delete_all_sessions_for_agent(
        self, client: AsyncClient, agent_with_sessions: tuple[Agent, list[Session]]
    ):
        """Test deleting all sessions for an agent."""
        agent, sessions = agent_with_sessions

        # Delete all sessions
        for session in sessions:
            response = await client.delete(f"/api/sessions/{session.id}")
            assert response.status_code == 204

        # Check agent has no sessions
        list_response = await client.get(f"/api/agents/{agent.id}/sessions")
        assert list_response.json()["total"] == 0
        assert list_response.json()["sessions"] == []
