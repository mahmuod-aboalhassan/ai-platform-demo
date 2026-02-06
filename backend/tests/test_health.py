"""
Tests for Health Check Endpoint.
"""
import pytest
from httpx import AsyncClient


class TestHealthEndpoint:
    """Test suite for /api/health endpoint."""

    @pytest.mark.asyncio
    async def test_health_check_returns_200(self, client: AsyncClient):
        """Test that health check returns 200 OK."""
        response = await client.get("/api/health")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_health_check_response_structure(self, client: AsyncClient):
        """Test that health check returns correct response structure."""
        response = await client.get("/api/health")
        data = response.json()

        assert "status" in data
        assert "version" in data
        assert "database" in data
        assert "openai" in data

    @pytest.mark.asyncio
    async def test_health_check_database_healthy(self, client: AsyncClient):
        """Test that database status is healthy."""
        response = await client.get("/api/health")
        data = response.json()

        assert data["database"] == "healthy"

    @pytest.mark.asyncio
    async def test_health_check_has_version(self, client: AsyncClient):
        """Test that version is returned."""
        response = await client.get("/api/health")
        data = response.json()

        assert data["version"] == "1.0.0"
