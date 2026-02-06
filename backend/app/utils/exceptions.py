from fastapi import HTTPException, status


class AgentNotFoundError(HTTPException):
    """Raised when an agent is not found."""

    def __init__(self, agent_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID {agent_id} not found",
        )


class SessionNotFoundError(HTTPException):
    """Raised when a session is not found."""

    def __init__(self, session_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with ID {session_id} not found",
        )


class AudioTooLargeError(HTTPException):
    """Raised when audio file is too large."""

    def __init__(self, max_size_mb: int):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Audio file too large (max {max_size_mb}MB)",
        )


class TranscriptionFailedError(HTTPException):
    """Raised when audio transcription fails."""

    def __init__(self):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not transcribe audio. Please try speaking more clearly.",
        )
