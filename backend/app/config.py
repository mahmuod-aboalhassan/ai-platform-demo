from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "AI Agent Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./ai_agent.db"

    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_TTS_MODEL: str = "tts-1"
    OPENAI_TTS_VOICE: str = "alloy"
    OPENAI_WHISPER_MODEL: str = "whisper-1"

    # Audio settings
    MAX_AUDIO_DURATION: int = 120  # 2 minutes in seconds
    MAX_AUDIO_SIZE: int = 5 * 1024 * 1024  # 5MB
    AUDIO_UPLOAD_DIR: str = "audio_files/uploads"
    AUDIO_TTS_DIR: str = "audio_files/tts"

    # API settings
    API_PREFIX: str = "/api"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
