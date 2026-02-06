"""
Comprehensive Tests for Messages API Endpoints.

Endpoints tested:
- GET /api/sessions/{session_id}/messages - List messages with pagination
- POST /api/sessions/{session_id}/messages - Send message (SSE streaming)
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch, MagicMock

from app.models.agent import Agent
from app.models.session import Session
from app.models.message import Message


class TestListMessages:
    """Test suite for GET /api/sessions/{session_id}/messages endpoint."""

    @pytest.mark.asyncio
    async def test_list_messages_empty(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test listing messages when session has no messages."""
        response = await client.get(f"/api/sessions/{sample_session.id}/messages")

        assert response.status_code == 200
        data = response.json()
        assert data["messages"] == []
        assert data["has_more"] is False
        assert data["total_count"] == 0

    @pytest.mark.asyncio
    async def test_list_messages_with_data(
        self, client: AsyncClient, sample_session: Session, sample_messages: list[Message]
    ):
        """Test listing messages with existing data."""
        response = await client.get(f"/api/sessions/{sample_session.id}/messages")

        assert response.status_code == 200
        data = response.json()
        assert len(data["messages"]) == 50  # Default limit
        assert data["total_count"] == 60

    @pytest.mark.asyncio
    async def test_list_messages_response_structure(
        self, client: AsyncClient, sample_session: Session, sample_messages: list[Message]
    ):
        """Test that list response has correct structure."""
        response = await client.get(f"/api/sessions/{sample_session.id}/messages")
        data = response.json()

        assert "messages" in data
        assert "has_more" in data
        assert "total_count" in data
        assert isinstance(data["messages"], list)
        assert isinstance(data["has_more"], bool)
        assert isinstance(data["total_count"], int)

    @pytest.mark.asyncio
    async def test_list_messages_message_structure(
        self, client: AsyncClient, sample_session: Session, sample_messages: list[Message]
    ):
        """Test that messages have correct structure."""
        response = await client.get(f"/api/sessions/{sample_session.id}/messages")
        data = response.json()

        message = data["messages"][0]
        required_fields = [
            "id",
            "session_id",
            "role",
            "content",
            "message_type",
            "created_at",
        ]
        for field in required_fields:
            assert field in message

    @pytest.mark.asyncio
    async def test_list_messages_session_not_found(self, client: AsyncClient):
        """Test listing messages for non-existent session."""
        response = await client.get("/api/sessions/non-existent-id/messages")

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_list_messages_default_limit(
        self, client: AsyncClient, sample_session: Session, sample_messages: list[Message]
    ):
        """Test that default limit is 50."""
        response = await client.get(f"/api/sessions/{sample_session.id}/messages")
        data = response.json()

        assert len(data["messages"]) == 50
        assert data["has_more"] is True

    @pytest.mark.asyncio
    async def test_list_messages_custom_limit(
        self, client: AsyncClient, sample_session: Session, sample_messages: list[Message]
    ):
        """Test custom limit parameter."""
        response = await client.get(
            f"/api/sessions/{sample_session.id}/messages?limit=10"
        )
        data = response.json()

        assert len(data["messages"]) == 10
        assert data["has_more"] is True

    @pytest.mark.asyncio
    async def test_list_messages_max_limit(
        self, client: AsyncClient, sample_session: Session, sample_messages: list[Message]
    ):
        """Test max limit (100)."""
        response = await client.get(
            f"/api/sessions/{sample_session.id}/messages?limit=100"
        )
        data = response.json()

        assert len(data["messages"]) == 60  # Only 60 messages exist
        assert data["has_more"] is False

    @pytest.mark.asyncio
    async def test_list_messages_limit_over_max_rejected(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test that limit over 100 is rejected."""
        response = await client.get(
            f"/api/sessions/{sample_session.id}/messages?limit=101"
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_list_messages_limit_zero_rejected(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test that limit of 0 is rejected."""
        response = await client.get(
            f"/api/sessions/{sample_session.id}/messages?limit=0"
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_list_messages_negative_limit_rejected(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test that negative limit is rejected."""
        response = await client.get(
            f"/api/sessions/{sample_session.id}/messages?limit=-1"
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_list_messages_pagination_with_before(
        self, client: AsyncClient, sample_session: Session, sample_messages: list[Message]
    ):
        """Test pagination using before cursor."""
        # Get first page
        first_response = await client.get(
            f"/api/sessions/{sample_session.id}/messages?limit=20"
        )
        first_data = first_response.json()
        first_message_id = first_data["messages"][0]["id"]

        # Get older messages
        second_response = await client.get(
            f"/api/sessions/{sample_session.id}/messages?limit=20&before={first_message_id}"
        )
        second_data = second_response.json()

        # Should get different messages
        second_ids = {m["id"] for m in second_data["messages"]}
        assert first_message_id not in second_ids

    @pytest.mark.asyncio
    async def test_list_messages_chronological_order(
        self, client: AsyncClient, sample_session: Session, sample_messages: list[Message]
    ):
        """Test that messages are in chronological order."""
        response = await client.get(f"/api/sessions/{sample_session.id}/messages")
        data = response.json()

        messages = data["messages"]
        for i in range(len(messages) - 1):
            assert messages[i]["created_at"] <= messages[i + 1]["created_at"]

    @pytest.mark.asyncio
    async def test_list_messages_has_more_true(
        self, client: AsyncClient, sample_session: Session, sample_messages: list[Message]
    ):
        """Test has_more is true when more messages exist."""
        response = await client.get(
            f"/api/sessions/{sample_session.id}/messages?limit=10"
        )
        data = response.json()

        assert data["has_more"] is True
        assert data["total_count"] == 60

    @pytest.mark.asyncio
    async def test_list_messages_has_more_false(
        self, client: AsyncClient, sample_session: Session, sample_messages: list[Message]
    ):
        """Test has_more is false when no more messages exist."""
        response = await client.get(
            f"/api/sessions/{sample_session.id}/messages?limit=100"
        )
        data = response.json()

        assert data["has_more"] is False


class TestSendMessage:
    """Test suite for POST /api/sessions/{session_id}/messages endpoint."""

    @pytest.mark.asyncio
    async def test_send_message_session_not_found(self, client: AsyncClient):
        """Test sending message to non-existent session."""
        message_data = {"content": "Hello, AI!"}
        response = await client.post(
            "/api/sessions/non-existent-id/messages", json=message_data
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_send_message_empty_content_rejected(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test that empty message content is rejected."""
        message_data = {"content": ""}
        response = await client.post(
            f"/api/sessions/{sample_session.id}/messages", json=message_data
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_send_message_missing_content_rejected(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test that missing content field is rejected."""
        response = await client.post(
            f"/api/sessions/{sample_session.id}/messages", json={}
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_send_message_returns_sse_stream(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test that send message returns SSE stream."""
        # Mock the chat service to avoid actual OpenAI calls
        with patch("app.services.chat_service.ChatService") as mock_chat_service:
            mock_instance = MagicMock()

            async def mock_stream(*args):
                yield "data: {\"type\": \"chunk\", \"content\": \"Hello\"}\n\n"
                yield "data: {\"type\": \"done\"}\n\n"

            mock_instance.send_message_stream = mock_stream
            mock_chat_service.return_value = mock_instance

            message_data = {"content": "Hello, AI!"}
            response = await client.post(
                f"/api/sessions/{sample_session.id}/messages", json=message_data
            )

            assert response.status_code == 200
            assert response.headers["content-type"] == "text/event-stream; charset=utf-8"

    @pytest.mark.asyncio
    async def test_send_message_with_long_content(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test sending message with long content."""
        with patch("app.services.chat_service.ChatService") as mock_chat_service:
            mock_instance = MagicMock()

            async def mock_stream(*args):
                yield "data: {\"type\": \"done\"}\n\n"

            mock_instance.send_message_stream = mock_stream
            mock_chat_service.return_value = mock_instance

            message_data = {"content": "A" * 5000}  # Long message
            response = await client.post(
                f"/api/sessions/{sample_session.id}/messages", json=message_data
            )

            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_send_message_with_unicode_content(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test sending message with unicode content."""
        with patch("app.services.chat_service.ChatService") as mock_chat_service:
            mock_instance = MagicMock()

            async def mock_stream(*args):
                yield "data: {\"type\": \"done\"}\n\n"

            mock_instance.send_message_stream = mock_stream
            mock_chat_service.return_value = mock_instance

            message_data = {"content": "Привет мир 你好世界 🎉"}
            response = await client.post(
                f"/api/sessions/{sample_session.id}/messages", json=message_data
            )

            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_send_message_sse_headers(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test that SSE response has correct headers."""
        with patch("app.services.chat_service.ChatService") as mock_chat_service:
            mock_instance = MagicMock()

            async def mock_stream(*args):
                yield "data: {\"type\": \"done\"}\n\n"

            mock_instance.send_message_stream = mock_stream
            mock_chat_service.return_value = mock_instance

            message_data = {"content": "Test message"}
            response = await client.post(
                f"/api/sessions/{sample_session.id}/messages", json=message_data
            )

            assert response.headers["cache-control"] == "no-cache"
            assert response.headers["connection"] == "keep-alive"


class TestMessageValidation:
    """Test suite for message input validation."""

    @pytest.mark.asyncio
    async def test_whitespace_only_content(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test handling of whitespace-only content."""
        with patch("app.services.chat_service.ChatService") as mock_chat_service:
            mock_instance = MagicMock()

            async def mock_stream(*args):
                yield "data: {\"type\": \"done\"}\n\n"

            mock_instance.send_message_stream = mock_stream
            mock_chat_service.return_value = mock_instance

            # Note: min_length=1 allows whitespace-only strings since "   " has len > 1
            # This test verifies the API accepts it (validation enhancement could be added later)
            message_data = {"content": "   "}
            response = await client.post(
                f"/api/sessions/{sample_session.id}/messages", json=message_data
            )

            # Whitespace is technically valid (min_length=1 is satisfied)
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_null_content_rejected(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test that null content is rejected."""
        message_data = {"content": None}
        response = await client.post(
            f"/api/sessions/{sample_session.id}/messages", json=message_data
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_non_string_content_rejected(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test that non-string content is rejected by Pydantic."""
        message_data = {"content": 12345}
        response = await client.post(
            f"/api/sessions/{sample_session.id}/messages", json=message_data
        )

        # Pydantic v2 does not coerce numbers to strings by default
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_extra_fields_ignored(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test that extra fields in request are ignored."""
        with patch("app.services.chat_service.ChatService") as mock_chat_service:
            mock_instance = MagicMock()

            async def mock_stream(*args):
                yield "data: {\"type\": \"done\"}\n\n"

            mock_instance.send_message_stream = mock_stream
            mock_chat_service.return_value = mock_instance

            message_data = {
                "content": "Test message",
                "extra_field": "should be ignored",
                "another_field": 123,
            }
            response = await client.post(
                f"/api/sessions/{sample_session.id}/messages", json=message_data
            )

            assert response.status_code == 200
