"""
Database configuration and session management.
Uses SQLAlchemy with PostgreSQL + pgvector.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Database URL from settings
DATABASE_URL = settings.DATABASE_URL

# Create engine
# For development, use a SQLite fallback if PostgreSQL is not available
if DATABASE_URL.startswith("postgresql"):
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
    )
else:
    # SQLite fallback for development
    engine = create_engine(
        "sqlite:///./techscout.db",
        connect_args={"check_same_thread": False},
    )

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    from app.models.models import Entity, Patent, Paper, Personnel, Technology, Citation, DRDOCapability
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")
