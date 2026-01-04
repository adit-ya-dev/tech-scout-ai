"""
Analysis service that orchestrates the complete entity analysis pipeline.
Uses HuggingFace models locally - no API keys required.
"""
import asyncio
import logging
from typing import Optional
import uuid
from datetime import datetime

from app.core.database import SessionLocal
from app.models.models import Entity, Patent, Paper, Personnel, EntityStatus
from app.services.scraper import scrape_entity_data
from app.services.ai_service import get_ai_service

logger = logging.getLogger(__name__)


async def update_entity_progress(entity_id: str, progress: int, status: Optional[EntityStatus] = None):
    """Update entity analysis progress in database."""
    db = SessionLocal()
    try:
        entity = db.query(Entity).filter(Entity.id == uuid.UUID(entity_id)).first()
        if entity:
            entity.analysis_progress = progress
            if status:
                entity.status = status
            entity.updated_at = datetime.utcnow()
            db.commit()
            logger.info(f"Entity {entity_id} progress: {progress}%")
    except Exception as e:
        logger.error(f"Error updating progress: {e}")
    finally:
        db.close()


async def trigger_entity_analysis(entity_id: str):
    """
    Main analysis pipeline for an entity.
    
    Pipeline steps:
    1. Scrape data from multiple sources (0-50%)
    2. Process and deduplicate patents (50-65%)
    3. Process and deduplicate papers (65-80%)
    4. Extract and save personnel (80-90%)
    5. Generate embeddings and finalize (90-100%)
    """
    logger.info(f"Starting analysis pipeline for entity: {entity_id}")
    
    db = SessionLocal()
    ai_service = get_ai_service()
    
    try:
        # Get entity
        entity = db.query(Entity).filter(Entity.id == uuid.UUID(entity_id)).first()
        if not entity:
            logger.error(f"Entity not found: {entity_id}")
            return
        
        entity_name = entity.name
        
        # Update status to analyzing
        entity.status = EntityStatus.ANALYZING
        entity.analysis_progress = 0
        db.commit()
        
        # ===== Step 1: Scrape data (0-50%) =====
        await update_entity_progress(entity_id, 5, EntityStatus.ANALYZING)
        logger.info(f"Starting scrape for: {entity_name}")
        
        try:
            scraped_data = await scrape_entity_data(entity_name, entity.website)
        except Exception as e:
            logger.error(f"Scraping failed: {e}")
            scraped_data = {"patents": [], "papers": [], "personnel": [], "technologies": []}
        
        await update_entity_progress(entity_id, 50)
        
        # ===== Step 2: Process patents (50-65%) =====
        patent_count = 0
        for patent_data in scraped_data.get("patents", []):
            try:
                # Check if patent already exists
                patent_number = patent_data.get("patent_number", "")
                if patent_number:
                    existing = db.query(Patent).filter(
                        Patent.patent_number == patent_number
                    ).first()
                    if existing:
                        continue
                
                # Generate embedding for patent
                text = f"{patent_data.get('title', '')} {patent_data.get('abstract', '')}"
                embedding = ai_service.generate_embedding(text) if text.strip() else None
                
                patent = Patent(
                    entity_id=entity.id,
                    patent_number=patent_number or f"GEN-{uuid.uuid4().hex[:8]}",
                    title=patent_data.get("title", "Unknown"),
                    abstract=patent_data.get("abstract"),
                    filing_date=patent_data.get("filing_date"),
                    status=patent_data.get("status", "unknown"),
                    inventors=patent_data.get("inventors", []),
                    technologies=scraped_data.get("technologies", [])[:5],
                    embedding=embedding if embedding else None,
                    source_url=patent_data.get("source_url"),
                )
                db.add(patent)
                patent_count += 1
                
            except Exception as e:
                logger.error(f"Error saving patent: {e}")
                continue
        
        db.commit()
        await update_entity_progress(entity_id, 65)
        logger.info(f"Saved {patent_count} patents")
        
        # ===== Step 3: Process papers (65-80%) =====
        paper_count = 0
        for paper_data in scraped_data.get("papers", []):
            try:
                # Check if paper already exists by DOI or title
                doi = paper_data.get("doi")
                title = paper_data.get("title", "")
                
                if doi:
                    existing = db.query(Paper).filter(Paper.doi == doi).first()
                    if existing:
                        continue
                
                # Generate embedding for paper
                text = f"{title} {paper_data.get('abstract', '')}"
                embedding = ai_service.generate_embedding(text) if text.strip() else None
                
                paper = Paper(
                    entity_id=entity.id,
                    title=title or "Unknown Paper",
                    abstract=paper_data.get("abstract"),
                    authors=paper_data.get("authors", []),
                    publication_date=paper_data.get("publication_date"),
                    venue=paper_data.get("venue"),
                    doi=doi,
                    technologies=scraped_data.get("technologies", [])[:5],
                    citation_count=paper_data.get("citation_count", 0),
                    embedding=embedding if embedding else None,
                    source_url=paper_data.get("source_url"),
                )
                db.add(paper)
                paper_count += 1
                
            except Exception as e:
                logger.error(f"Error saving paper: {e}")
                continue
        
        db.commit()
        await update_entity_progress(entity_id, 80)
        logger.info(f"Saved {paper_count} papers")
        
        # ===== Step 4: Process personnel (80-90%) =====
        personnel_count = 0
        for person_data in scraped_data.get("personnel", []):
            try:
                name = person_data.get("name", "").strip()
                if not name:
                    continue
                
                # Check if person already exists for this entity
                existing = db.query(Personnel).filter(
                    Personnel.entity_id == entity.id,
                    Personnel.name == name
                ).first()
                
                if not existing:
                    person = Personnel(
                        entity_id=entity.id,
                        name=name,
                        role=person_data.get("role", "Researcher"),
                        expertise=scraped_data.get("technologies", [])[:3],
                        publication_count=person_data.get("publication_count", 0),
                    )
                    db.add(person)
                    personnel_count += 1
                else:
                    # Update publication count if higher
                    new_count = person_data.get("publication_count", 0)
                    if new_count > existing.publication_count:
                        existing.publication_count = new_count
                
            except Exception as e:
                logger.error(f"Error saving personnel: {e}")
                continue
        
        db.commit()
        await update_entity_progress(entity_id, 90)
        logger.info(f"Saved {personnel_count} personnel")
        
        # ===== Step 5: Finalize (90-100%) =====
        entity.patent_count = patent_count
        entity.paper_count = paper_count
        entity.personnel_count = personnel_count
        entity.focus_areas = scraped_data.get("technologies", [])
        entity.status = EntityStatus.COMPLETE
        entity.analysis_progress = 100
        entity.updated_at = datetime.utcnow()
        db.commit()
        
        logger.info(f"Analysis complete for {entity_name}: {patent_count} patents, {paper_count} papers, {personnel_count} personnel")
        
    except Exception as e:
        logger.error(f"Analysis failed for entity {entity_id}: {e}")
        # Update entity status to error
        try:
            entity = db.query(Entity).filter(Entity.id == uuid.UUID(entity_id)).first()
            if entity:
                entity.status = EntityStatus.ERROR
                entity.analysis_progress = 0
                db.commit()
        except:
            pass
    finally:
        db.close()
