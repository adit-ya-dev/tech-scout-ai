"""
Database models for Tech Scout AI.
Works with both SQLite (dev) and PostgreSQL with pgvector (prod).
"""
import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, String, Text, DateTime, Integer, Float, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


# Use String for UUID to support both SQLite and PostgreSQL
def generate_uuid():
    return str(uuid.uuid4())


class EntityType(str, enum.Enum):
    STARTUP = "startup"
    RESEARCH_LAB = "research_lab"
    INSTITUTION = "institution"
    COMPANY = "company"


class EntityStatus(str, enum.Enum):
    PENDING = "pending"
    ANALYZING = "analyzing"
    COMPLETE = "complete"
    ERROR = "error"


class Entity(Base):
    """Tracked organization entity."""
    __tablename__ = "entities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(50), default="startup")
    status = Column(String(50), default="pending")
    website = Column(String(500))
    description = Column(Text)
    focus_areas = Column(JSON, default=list)  # Use JSON for array storage
    
    # Analysis progress (0-100)
    analysis_progress = Column(Integer, default=0)
    
    # Counts (denormalized for performance)
    patent_count = Column(Integer, default=0)
    paper_count = Column(Integer, default=0)
    personnel_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patents = relationship("Patent", back_populates="entity", cascade="all, delete-orphan")
    papers = relationship("Paper", back_populates="entity", cascade="all, delete-orphan")
    personnel = relationship("Personnel", back_populates="entity", cascade="all, delete-orphan")


class Patent(Base):
    """Patent document."""
    __tablename__ = "patents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    entity_id = Column(String(36), ForeignKey("entities.id"), nullable=False)
    
    patent_number = Column(String(100), unique=True, index=True)
    title = Column(Text, nullable=False)
    abstract = Column(Text)
    filing_date = Column(DateTime)
    grant_date = Column(DateTime)
    status = Column(String(50))  # pending, granted, expired
    
    inventors = Column(JSON, default=list)
    technologies = Column(JSON, default=list)
    
    # Vector embedding stored as JSON for SQLite compatibility
    # For PostgreSQL with pgvector, you'd use Vector(1024)
    embedding = Column(JSON)
    
    # Source tracking
    source_url = Column(String(500))
    scraped_at = Column(DateTime, default=datetime.utcnow)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    entity = relationship("Entity", back_populates="patents")


class Paper(Base):
    """Research paper/publication."""
    __tablename__ = "papers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    entity_id = Column(String(36), ForeignKey("entities.id"), nullable=False)
    
    title = Column(Text, nullable=False)
    abstract = Column(Text)
    authors = Column(JSON, default=list)
    publication_date = Column(DateTime)
    venue = Column(String(255))  # Journal/Conference name
    doi = Column(String(100), index=True)
    
    technologies = Column(JSON, default=list)
    citation_count = Column(Integer, default=0)
    
    # Vector embedding
    embedding = Column(JSON)
    
    # Source tracking
    source_url = Column(String(500))
    scraped_at = Column(DateTime, default=datetime.utcnow)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    entity = relationship("Entity", back_populates="papers")


class Personnel(Base):
    """Key researcher/scientist."""
    __tablename__ = "personnel"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    entity_id = Column(String(36), ForeignKey("entities.id"), nullable=False)
    
    name = Column(String(255), nullable=False)
    role = Column(String(100))
    expertise = Column(JSON, default=list)
    
    publication_count = Column(Integer, default=0)
    patent_count = Column(Integer, default=0)
    h_index = Column(Integer)
    
    # Profile links
    google_scholar_id = Column(String(100))
    orcid = Column(String(50))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    entity = relationship("Entity", back_populates="personnel")


class Technology(Base):
    """Technology domain/category."""
    __tablename__ = "technologies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, unique=True)
    category = Column(String(100))
    description = Column(Text)
    
    # DRDO capability score (for gap analysis)
    drdo_capability_score = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class Citation(Base):
    """Citation relationship between documents."""
    __tablename__ = "citations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    
    source_id = Column(String(36), nullable=False)
    source_type = Column(String(20))  # patent or paper
    
    target_id = Column(String(36), nullable=False)
    target_type = Column(String(20))  # patent or paper
    
    created_at = Column(DateTime, default=datetime.utcnow)


class DRDOCapability(Base):
    """DRDO internal capability mapping."""
    __tablename__ = "drdo_capabilities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    technology_domain = Column(String(255), nullable=False)
    capability_score = Column(Float, default=0.0)  # 0-100
    description = Column(Text)
    last_assessed = Column(DateTime, default=datetime.utcnow)
