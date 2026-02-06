import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.connection import init_db
from app.routes import agents, sessions, messages, voice, health, documents

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting AI Agent Platform...")

    # Validate OpenAI API key
    if not settings.OPENAI_API_KEY:
        logger.error("=" * 80)
        logger.error("CRITICAL: OPENAI_API_KEY is not set!")
        logger.error("The application will not be able to generate AI responses.")
        logger.error("Please set OPENAI_API_KEY in your .env file or environment variables.")
        logger.error("Get your API key from: https://platform.openai.com/api-keys")
        logger.error("=" * 80)
    else:
        logger.info("OpenAI API key is configured")

    await init_db()
    logger.info("Database initialized")
    yield
    # Shutdown
    logger.info("Shutting down AI Agent Platform...")
    pass


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# CORS middleware - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix=settings.API_PREFIX, tags=["Health"])
app.include_router(agents.router, prefix=settings.API_PREFIX, tags=["Agents"])
app.include_router(sessions.router, prefix=settings.API_PREFIX, tags=["Sessions"])
app.include_router(messages.router, prefix=settings.API_PREFIX, tags=["Messages"])
app.include_router(voice.router, prefix=settings.API_PREFIX, tags=["Voice"])
app.include_router(documents.router, prefix=settings.API_PREFIX, tags=["Documents"])

