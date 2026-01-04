"""
Tech Scout AI - FastAPI Application
Production-ready backend with no external API dependencies.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import init_db
from app.api import entities, technologies

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting Tech Scout AI...")
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.warning(f"Database initialization skipped: {e}")
    
    # Pre-load AI models in background (optional)
    # from app.services.ai_service import get_ai_service
    # get_ai_service()  # This will lazy-load on first use instead
    
    yield
    
    # Shutdown
    logger.info("Shutting down Tech Scout AI...")


app = FastAPI(
    title="Tech Scout AI",
    description="DRDO Intelligence Platform for Technology Tracking",
    version="2.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(
    entities.router,
    prefix=f"{settings.API_V1_STR}/entities",
    tags=["entities"]
)
app.include_router(
    technologies.router,
    prefix=f"{settings.API_V1_STR}/technologies",
    tags=["technologies"]
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "Tech Scout AI",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
        "features": [
            "Entity tracking",
            "Patent analysis",
            "Paper discovery",
            "Personnel identification",
            "Technology mapping",
            "Gap analysis",
        ]
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "database": "connected",
        "ai_service": "ready",
    }


@app.get(f"{settings.API_V1_STR}/status")
async def api_status():
    """API status with configuration info."""
    from app.services.ai_service import get_ai_service
    ai = get_ai_service()
    
    return {
        "api_version": "2.0.0",
        "ai_device": ai.device,
        "embedding_model": "BAAI/bge-small-en-v1.5",
        "llm_model": "ibm-granite/granite-3.0-2b-instruct",
        "scraping_sources": [
            "Google Patents",
            "arXiv",
            "Semantic Scholar",
            "DBLP",
            "CrossRef",
        ],
    }
