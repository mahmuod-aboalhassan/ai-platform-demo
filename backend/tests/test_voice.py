"""
Comprehensive Tests for Voice API Endpoints.

Endpoints tested:
- POST /api/sessions/{session_id}/voice - Send voice message
- GET /api/audio/{folder}/{filename} - Serve audio files
"""
import io
import os
from datetime import datetime
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient

from app.models.agent import Agent
from app.models.session import Session
from app.schemas.message import MessageResponse, MessageRoleEnum, MessageTypeEnum
from app.schemas.voice import VoiceMessageResponse


def create_mock_audio_file(size_bytes: int = 1024, filename: str = "test.webm") -> tuple[io.BytesIO, str]:
    """Create a mock audio file for testing."""
    content = b"WEBM" + b"\x00" * (size_bytes - 4)  # Fake WebM header
    file = io.BytesIO(content)
    file.name = filename
    return file, content.decode("latin-1")


def create_mock_voice_response(session_id: str) -> VoiceMessageResponse:
    """Create a mock VoiceMessageResponse for testing."""
    return VoiceMessageResponse(
        user_message=MessageResponse(
            id="user-msg-123",
            session_id=session_id,
            role=MessageRoleEnum.USER,
            content="Hello, this is a test",
            message_type=MessageTypeEnum.VOICE,
            audio_url="/api/audio/uploads/test.webm",
            tts_audio_url=None,
            created_at=datetime.now(),
        ),
        assistant_message=MessageResponse(
            id="assistant-msg-456",
            session_id=session_id,
            role=MessageRoleEnum.ASSISTANT,
            content="Hi there! How can I help?",
            message_type=MessageTypeEnum.TEXT,
            audio_url=None,
            tts_audio_url="/api/audio/tts/response.mp3",
            created_at=datetime.now(),
        ),
    )


class TestSendVoiceMessage:
    """Test suite for POST /api/sessions/{session_id}/voice endpoint."""

    @pytest.mark.asyncio
    async def test_send_voice_session_not_found(self, client: AsyncClient):
        """Test sending voice message to non-existent session."""
        audio_file, _ = create_mock_audio_file()

        response = await client.post(
            "/api/sessions/non-existent-id/voice",
            files={"audio": ("test.webm", audio_file, "audio/webm")},
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_send_voice_missing_audio_file(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test sending voice message without audio file."""
        response = await client.post(
            f"/api/sessions/{sample_session.id}/voice",
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_send_voice_file_too_large(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test that audio file over 5MB is rejected."""
        # Create file larger than 5MB
        large_audio = io.BytesIO(b"\x00" * (6 * 1024 * 1024))  # 6MB

        response = await client.post(
            f"/api/sessions/{sample_session.id}/voice",
            files={"audio": ("test.webm", large_audio, "audio/webm")},
        )

        assert response.status_code == 400
        assert "too large" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_send_voice_success(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test successful voice message processing."""
        with patch("app.services.voice_service.VoiceService") as mock_voice_service:
            mock_instance = MagicMock()
            mock_instance.process_voice_message = AsyncMock(
                return_value=create_mock_voice_response(sample_session.id)
            )
            mock_voice_service.return_value = mock_instance

            audio_file, _ = create_mock_audio_file()

            response = await client.post(
                f"/api/sessions/{sample_session.id}/voice",
                files={"audio": ("test.webm", audio_file, "audio/webm")},
            )

            assert response.status_code == 200
            data = response.json()
            assert "user_message" in data
            assert "assistant_message" in data

    @pytest.mark.asyncio
    async def test_send_voice_response_structure(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test voice response has correct structure."""
        with patch("app.services.voice_service.VoiceService") as mock_voice_service:
            mock_instance = MagicMock()
            mock_instance.process_voice_message = AsyncMock(
                return_value=create_mock_voice_response(sample_session.id)
            )
            mock_voice_service.return_value = mock_instance

            audio_file, _ = create_mock_audio_file()

            response = await client.post(
                f"/api/sessions/{sample_session.id}/voice",
                files={"audio": ("test.webm", audio_file, "audio/webm")},
            )

            assert response.status_code == 200
            data = response.json()

            # Check user_message structure
            user_msg = data["user_message"]
            assert "id" in user_msg
            assert "session_id" in user_msg
            assert "role" in user_msg
            assert "content" in user_msg
            assert "message_type" in user_msg

            # Check assistant_message structure
            assistant_msg = data["assistant_message"]
            assert "id" in assistant_msg
            assert "session_id" in assistant_msg
            assert "role" in assistant_msg
            assert "content" in assistant_msg

    @pytest.mark.asyncio
    async def test_send_voice_file_size_boundary(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test audio file exactly at 5MB limit."""
        with patch("app.services.voice_service.VoiceService") as mock_voice_service:
            mock_instance = MagicMock()
            mock_instance.process_voice_message = AsyncMock(
                return_value=create_mock_voice_response(sample_session.id)
            )
            mock_voice_service.return_value = mock_instance

            # Create file exactly at 5MB limit
            boundary_audio = io.BytesIO(b"\x00" * (5 * 1024 * 1024))

            response = await client.post(
                f"/api/sessions/{sample_session.id}/voice",
                files={"audio": ("test.webm", boundary_audio, "audio/webm")},
            )

            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_send_voice_different_audio_formats(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test various audio file formats."""
        with patch("app.services.voice_service.VoiceService") as mock_voice_service:
            mock_instance = MagicMock()
            mock_instance.process_voice_message = AsyncMock(
                return_value=create_mock_voice_response(sample_session.id)
            )
            mock_voice_service.return_value = mock_instance

            formats = [
                ("test.webm", "audio/webm"),
                ("test.mp3", "audio/mpeg"),
                ("test.wav", "audio/wav"),
                ("test.m4a", "audio/mp4"),
            ]

            for filename, content_type in formats:
                audio_file = io.BytesIO(b"\x00" * 1024)

                response = await client.post(
                    f"/api/sessions/{sample_session.id}/voice",
                    files={"audio": (filename, audio_file, content_type)},
                )

                assert response.status_code == 200, f"Failed for {filename}"


class TestServeAudio:
    """Test suite for GET /api/audio/{folder}/{filename} endpoint."""

    @pytest.fixture
    def audio_test_dir(self, tmp_path):
        """Create temporary audio directories for testing."""
        uploads_dir = tmp_path / "audio_files" / "uploads"
        tts_dir = tmp_path / "audio_files" / "tts"
        uploads_dir.mkdir(parents=True)
        tts_dir.mkdir(parents=True)

        # Create test files
        (uploads_dir / "test.webm").write_bytes(b"WEBM test content")
        (tts_dir / "test.mp3").write_bytes(b"MP3 test content")

        return tmp_path

    @pytest.mark.asyncio
    async def test_serve_audio_uploads_not_found(self, client: AsyncClient):
        """Test serving non-existent file from uploads."""
        response = await client.get("/api/audio/uploads/nonexistent.webm")

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_serve_audio_tts_not_found(self, client: AsyncClient):
        """Test serving non-existent file from tts."""
        response = await client.get("/api/audio/tts/nonexistent.mp3")

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_serve_audio_invalid_folder(self, client: AsyncClient):
        """Test serving from invalid folder."""
        response = await client.get("/api/audio/invalid/test.mp3")

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_serve_audio_uploads_success(self, client: AsyncClient):
        """Test serving existing file from uploads."""
        # Create the audio_files/uploads directory and test file
        os.makedirs("audio_files/uploads", exist_ok=True)
        test_file_path = Path("audio_files/uploads/test_serve.webm")
        test_file_path.write_bytes(b"WEBM test content for serving")

        try:
            response = await client.get("/api/audio/uploads/test_serve.webm")

            assert response.status_code == 200
            assert response.headers["content-type"] == "audio/webm"
        finally:
            # Cleanup
            if test_file_path.exists():
                test_file_path.unlink()

    @pytest.mark.asyncio
    async def test_serve_audio_tts_success(self, client: AsyncClient):
        """Test serving existing file from tts."""
        # Create the audio_files/tts directory and test file
        os.makedirs("audio_files/tts", exist_ok=True)
        test_file_path = Path("audio_files/tts/test_serve.mp3")
        test_file_path.write_bytes(b"MP3 test content for serving")

        try:
            response = await client.get("/api/audio/tts/test_serve.mp3")

            assert response.status_code == 200
            assert response.headers["content-type"] == "audio/mpeg"
        finally:
            # Cleanup
            if test_file_path.exists():
                test_file_path.unlink()

    @pytest.mark.asyncio
    async def test_serve_audio_correct_content_type_webm(self, client: AsyncClient):
        """Test correct content type for webm files."""
        os.makedirs("audio_files/uploads", exist_ok=True)
        test_file_path = Path("audio_files/uploads/content_type_test.webm")
        test_file_path.write_bytes(b"WEBM content")

        try:
            response = await client.get("/api/audio/uploads/content_type_test.webm")

            assert response.status_code == 200
            assert response.headers["content-type"] == "audio/webm"
        finally:
            if test_file_path.exists():
                test_file_path.unlink()

    @pytest.mark.asyncio
    async def test_serve_audio_correct_content_type_mp3(self, client: AsyncClient):
        """Test correct content type for mp3 files."""
        os.makedirs("audio_files/tts", exist_ok=True)
        test_file_path = Path("audio_files/tts/content_type_test.mp3")
        test_file_path.write_bytes(b"MP3 content")

        try:
            response = await client.get("/api/audio/tts/content_type_test.mp3")

            assert response.status_code == 200
            assert response.headers["content-type"] == "audio/mpeg"
        finally:
            if test_file_path.exists():
                test_file_path.unlink()

    @pytest.mark.asyncio
    async def test_serve_audio_inline_disposition(self, client: AsyncClient):
        """Test that audio files have inline content disposition."""
        os.makedirs("audio_files/uploads", exist_ok=True)
        test_file_path = Path("audio_files/uploads/disposition_test.webm")
        test_file_path.write_bytes(b"WEBM content")

        try:
            response = await client.get("/api/audio/uploads/disposition_test.webm")

            assert response.status_code == 200
            assert response.headers["content-disposition"] == "inline"
        finally:
            if test_file_path.exists():
                test_file_path.unlink()

    @pytest.mark.asyncio
    async def test_serve_audio_path_traversal_rejected(self, client: AsyncClient):
        """Test that path traversal attempts are rejected."""
        # Try to access files outside allowed directories
        dangerous_paths = [
            "/api/audio/uploads/../../../etc/passwd",
            "/api/audio/tts/../../secrets.txt",
            "/api/audio/uploads/..%2F..%2Fetc%2Fpasswd",
        ]

        for path in dangerous_paths:
            response = await client.get(path)
            # Should be 404 (not found) not a security breach
            assert response.status_code == 404


class TestVoiceValidation:
    """Test suite for voice input validation."""

    @pytest.mark.asyncio
    async def test_empty_audio_file(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test that empty audio file is handled."""
        empty_audio = io.BytesIO(b"")

        response = await client.post(
            f"/api/sessions/{sample_session.id}/voice",
            files={"audio": ("empty.webm", empty_audio, "audio/webm")},
        )

        # Should either reject or handle gracefully
        assert response.status_code in [200, 400, 422]

    @pytest.mark.asyncio
    async def test_very_small_audio_file(
        self, client: AsyncClient, sample_session: Session
    ):
        """Test handling of very small audio file."""
        with patch("app.services.voice_service.VoiceService") as mock_voice_service:
            mock_instance = MagicMock()
            mock_instance.process_voice_message = AsyncMock(
                return_value=create_mock_voice_response(sample_session.id)
            )
            mock_voice_service.return_value = mock_instance

            small_audio = io.BytesIO(b"\x00" * 100)  # 100 bytes

            response = await client.post(
                f"/api/sessions/{sample_session.id}/voice",
                files={"audio": ("small.webm", small_audio, "audio/webm")},
            )

            assert response.status_code == 200
