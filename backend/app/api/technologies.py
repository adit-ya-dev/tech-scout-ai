from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional
from app.models.technology import Technology, TechnologyCreate
from app.services.supabase_service import supabase_service
from app.services.embedding_service import embedding_service
from app.agents.crew import TechScoutCrew
import uuid

router = APIRouter()

@router.get("/", response_model=List[Technology])
def get_technologies():
    """
    List all tracked technologies.
    """
    try:
        data = supabase_service.get_technologies()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Technology)
def create_technology(tech: TechnologyCreate):
    """
    Manually add a technology.
    """
    try:
        # Convert pydantic to dict
        data = tech.model_dump(exclude_unset=True)
        result = supabase_service.create_technology(data)
        
        # Generate embedding in background? Or separate endpoint.
        # For now simple create.
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze")
def analyze_technology(name: str, query: str, background_tasks: BackgroundTasks):
    """
    Trigger the AI Agent Crew to research and analyze a technology.
    Runs in background.
    """
    def run_crew(tech_name, search_query):
        crew = TechScoutCrew(tech_name, search_query)
        result = crew.run()
        # TODO: Parse result and save to Supabase
        # This part requires parsing the CrewAI output string into structured data
        print(f"Crew Result for {tech_name}: {result}")

    background_tasks.add_task(run_crew, name, query)
    return {"message": "Analysis started in background", "technology": name}

@router.post("/search")
def semantic_search(query: str):
    """
    Search technologies by semantic similarity.
    """
    try:
        # Generate embedding for query
        embedding = embedding_service.generate_embeddings([query])[0]
        # Search in DB
        results = supabase_service.search_similar_technologies(embedding)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
