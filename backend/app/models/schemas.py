from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum
import uuid


class EntityType(str, Enum):
    STARTUP = "startup"
    RESEARCH_LAB = "research_lab"
    INSTITUTION = "institution"
    COMPANY = "company"


class EntityStatus(str, Enum):
    PENDING = "pending"
    ANALYZING = "analyzing"
    COMPLETE = "complete"
    ERROR = "error"


# ============== Entity Schemas ==============

class EntityCreate(BaseModel):
    """Schema for creating a new entity."""
    name: str = Field(..., min_length=2, max_length=255)
    type: EntityType = EntityType.STARTUP
    website: Optional[str] = None
    description: Optional[str] = None
    focus_areas: Optional[List[str]] = None


class EntityUpdate(BaseModel):
    """Schema for updating an entity."""
    name: Optional[str] = None
    type: Optional[EntityType] = None
    website: Optional[str] = None
    description: Optional[str] = None
    focus_areas: Optional[List[str]] = None
    status: Optional[EntityStatus] = None


class EntityResponse(BaseModel):
    """Schema for entity response."""
    id: str
    name: str
    type: EntityType
    status: EntityStatus
    website: Optional[str] = None
    description: Optional[str] = None
    focus_areas: Optional[List[str]] = None
    analysis_progress: int = 0
    patent_count: int = 0
    paper_count: int = 0
    personnel_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EntityListResponse(BaseModel):
    """Schema for list of entities."""
    items: List[EntityResponse]
    total: int
    page: int
    per_page: int


# ============== Patent Schemas ==============

class PatentResponse(BaseModel):
    """Schema for patent response."""
    id: str
    patent_number: str
    title: str
    abstract: Optional[str] = None
    filing_date: Optional[datetime] = None
    grant_date: Optional[datetime] = None
    status: Optional[str] = None
    inventors: Optional[List[str]] = None
    technologies: Optional[List[str]] = None
    source_url: Optional[str] = None

    class Config:
        from_attributes = True


# ============== Paper Schemas ==============

class PaperResponse(BaseModel):
    """Schema for paper response."""
    id: str
    title: str
    abstract: Optional[str] = None
    authors: Optional[List[str]] = None
    publication_date: Optional[datetime] = None
    venue: Optional[str] = None
    doi: Optional[str] = None
    technologies: Optional[List[str]] = None
    citation_count: int = 0

    class Config:
        from_attributes = True


# ============== Personnel Schemas ==============

class PersonnelResponse(BaseModel):
    """Schema for personnel response."""
    id: str
    name: str
    role: Optional[str] = None
    expertise: Optional[List[str]] = None
    publication_count: int = 0
    patent_count: int = 0
    h_index: Optional[int] = None

    class Config:
        from_attributes = True


# ============== Analysis Schemas ==============

class AnalysisRequest(BaseModel):
    """Schema for triggering analysis."""
    entity_id: str


class AnalysisResponse(BaseModel):
    """Schema for analysis response."""
    entity_id: str
    status: EntityStatus
    progress: int
    message: str


# ============== Gap Analysis Schemas ==============

class GapAnalysisItem(BaseModel):
    """Single domain gap analysis."""
    domain: str
    entity_score: float
    drdo_score: float
    gap: float  # entity_score - drdo_score (positive = entity leads)


class GapAnalysisResponse(BaseModel):
    """Schema for gap analysis response."""
    entity_id: str
    entity_name: str
    analysis: List[GapAnalysisItem]
    critical_gaps: int  # Number of domains where entity significantly leads
    collaboration_opportunities: int  # Number of domains with similar scores


# ============== Dashboard Stats ==============

class DashboardStats(BaseModel):
    """Dashboard statistics."""
    total_entities: int
    total_patents: int
    total_papers: int
    total_personnel: int
    critical_alerts: int
    entities_analyzing: int
