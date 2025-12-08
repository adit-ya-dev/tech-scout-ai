from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.models.models import Entity, EntityStatus, EntityType
from app.models.schemas import (
    EntityCreate,
    EntityUpdate,
    EntityResponse,
    EntityListResponse,
    DashboardStats,
)
from app.services.analysis_service import trigger_entity_analysis

router = APIRouter()


@router.get("/", response_model=EntityListResponse)
async def list_entities(
    page: int = 1,
    per_page: int = 20,
    type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List all tracked entities with filtering and pagination."""
    query = db.query(Entity)
    
    if type and type != "all":
        query = query.filter(Entity.type == type)
    if status and status != "all":
        query = query.filter(Entity.status == status)
    if search:
        query = query.filter(Entity.name.ilike(f"%{search}%"))
    
    total = query.count()
    items = query.order_by(Entity.updated_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    
    return EntityListResponse(
        items=[EntityResponse(
            id=str(e.id),
            name=e.name,
            type=e.type,
            status=e.status,
            website=e.website,
            description=e.description,
            focus_areas=e.focus_areas,
            analysis_progress=e.analysis_progress or 0,
            patent_count=e.patent_count or 0,
            paper_count=e.paper_count or 0,
            personnel_count=e.personnel_count or 0,
            created_at=e.created_at,
            updated_at=e.updated_at,
        ) for e in items],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.post("/", response_model=EntityResponse)
async def create_entity(
    entity: EntityCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Create a new entity and trigger analysis."""
    # Create entity
    db_entity = Entity(
        name=entity.name,
        type=entity.type,
        website=entity.website,
        description=entity.description,
        focus_areas=entity.focus_areas,
        status=EntityStatus.PENDING,
    )
    db.add(db_entity)
    db.commit()
    db.refresh(db_entity)
    
    # Trigger analysis in background
    background_tasks.add_task(trigger_entity_analysis, str(db_entity.id))
    
    return EntityResponse(
        id=str(db_entity.id),
        name=db_entity.name,
        type=db_entity.type,
        status=db_entity.status,
        website=db_entity.website,
        description=db_entity.description,
        focus_areas=db_entity.focus_areas,
        analysis_progress=0,
        patent_count=0,
        paper_count=0,
        personnel_count=0,
        created_at=db_entity.created_at,
        updated_at=db_entity.updated_at,
    )


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    total_entities = db.query(Entity).count()
    entities_analyzing = db.query(Entity).filter(Entity.status == EntityStatus.ANALYZING).count()
    
    # Aggregate counts from entities
    result = db.query(
        func.sum(Entity.patent_count).label("patents"),
        func.sum(Entity.paper_count).label("papers"),
        func.sum(Entity.personnel_count).label("personnel"),
    ).first()
    
    return DashboardStats(
        total_entities=total_entities,
        total_patents=result.patents or 0,
        total_papers=result.papers or 0,
        total_personnel=result.personnel or 0,
        critical_alerts=3,  # TODO: Calculate from gap analysis
        entities_analyzing=entities_analyzing,
    )


@router.get("/{entity_id}", response_model=EntityResponse)
async def get_entity(entity_id: str, db: Session = Depends(get_db)):
    """Get a single entity by ID."""
    entity = db.query(Entity).filter(Entity.id == uuid.UUID(entity_id)).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    return EntityResponse(
        id=str(entity.id),
        name=entity.name,
        type=entity.type,
        status=entity.status,
        website=entity.website,
        description=entity.description,
        focus_areas=entity.focus_areas,
        analysis_progress=entity.analysis_progress or 0,
        patent_count=entity.patent_count or 0,
        paper_count=entity.paper_count or 0,
        personnel_count=entity.personnel_count or 0,
        created_at=entity.created_at,
        updated_at=entity.updated_at,
    )


@router.patch("/{entity_id}", response_model=EntityResponse)
async def update_entity(
    entity_id: str,
    entity_update: EntityUpdate,
    db: Session = Depends(get_db),
):
    """Update an entity."""
    entity = db.query(Entity).filter(Entity.id == uuid.UUID(entity_id)).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    update_data = entity_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entity, field, value)
    
    db.commit()
    db.refresh(entity)
    
    return EntityResponse(
        id=str(entity.id),
        name=entity.name,
        type=entity.type,
        status=entity.status,
        website=entity.website,
        description=entity.description,
        focus_areas=entity.focus_areas,
        analysis_progress=entity.analysis_progress or 0,
        patent_count=entity.patent_count or 0,
        paper_count=entity.paper_count or 0,
        personnel_count=entity.personnel_count or 0,
        created_at=entity.created_at,
        updated_at=entity.updated_at,
    )


@router.delete("/{entity_id}")
async def delete_entity(entity_id: str, db: Session = Depends(get_db)):
    """Delete an entity and all associated data."""
    entity = db.query(Entity).filter(Entity.id == uuid.UUID(entity_id)).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    db.delete(entity)
    db.commit()
    
    return {"message": "Entity deleted successfully"}


@router.post("/{entity_id}/reanalyze")
async def reanalyze_entity(
    entity_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Trigger re-analysis of an entity."""
    entity = db.query(Entity).filter(Entity.id == uuid.UUID(entity_id)).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    # Reset status and trigger analysis
    entity.status = EntityStatus.PENDING
    entity.analysis_progress = 0
    db.commit()
    
    background_tasks.add_task(trigger_entity_analysis, entity_id)
    
    return {"message": "Re-analysis triggered", "entity_id": entity_id}
