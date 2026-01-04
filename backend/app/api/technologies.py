"""
Technology analysis API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import Technology
from app.services.ai_service import get_ai_service

router = APIRouter()


@router.get("/")
async def get_technologies(db: Session = Depends(get_db)):
    """List all technology domains."""
    technologies = db.query(Technology).all()
    return [
        {
            "id": str(t.id),
            "name": t.name,
            "category": t.category,
            "description": t.description,
            "drdo_capability_score": t.drdo_capability_score,
        }
        for t in technologies
    ]


@router.get("/domains")
async def get_technology_domains():
    """Get list of supported technology domains."""
    ai_service = get_ai_service()
    
    # Return the technology domains we can detect
    return {
        "domains": [
            {"name": "Quantum Computing", "category": "Computing"},
            {"name": "Machine Learning", "category": "AI"},
            {"name": "Cryptography", "category": "Security"},
            {"name": "Robotics", "category": "Automation"},
            {"name": "Materials Science", "category": "Engineering"},
            {"name": "Aerospace", "category": "Defense"},
            {"name": "Biotechnology", "category": "Life Sciences"},
            {"name": "Computer Vision", "category": "AI"},
            {"name": "Natural Language Processing", "category": "AI"},
            {"name": "Cybersecurity", "category": "Security"},
            {"name": "Internet of Things", "category": "Computing"},
            {"name": "5G/6G Communications", "category": "Telecom"},
        ]
    }


@router.post("/extract")
async def extract_technologies(text: str):
    """Extract technology domains from text."""
    ai_service = get_ai_service()
    technologies = ai_service.extract_technologies(text)
    return {"technologies": technologies}
