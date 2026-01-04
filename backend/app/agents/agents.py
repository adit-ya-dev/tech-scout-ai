"""
LangGraph Agent implementations using HuggingFace Transformers.
All AI runs locally - no API keys required.
"""
from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
from app.core.graph import AgentState
from app.services.ai_service import get_ai_service
import logging

logger = logging.getLogger(__name__)


def scout_agent(state: AgentState) -> AgentState:
    """
    Data Acquisition Agent (Scout).
    Responsible for gathering raw data about entities.
    
    This agent coordinates the scraping of:
    - Patents from Google Patents
    - Papers from arXiv, Semantic Scholar, DBLP, CrossRef
    - Personnel information from publications
    """
    entity_name = state.get("entity_name", "")
    messages = state.get("messages", [])
    
    messages.append({
        "role": "scout",
        "content": f"Starting data acquisition for: {entity_name}",
        "status": "in_progress"
    })
    
    # The actual scraping is done in the analysis service
    # This agent just coordinates and tracks state
    
    return {
        **state,
        "messages": messages,
        "current_step": "scout_complete",
    }


def analyst_agent(state: AgentState) -> AgentState:
    """
    IP & Document Analysis Agent (Analyst).
    Responsible for analyzing and extracting insights from documents.
    
    This agent:
    - Generates embeddings for semantic search
    - Extracts technology domains
    - Identifies key researchers and their expertise
    - Builds citation networks
    """
    entity_name = state.get("entity_name", "")
    messages = state.get("messages", [])
    patents = state.get("patents", [])
    papers = state.get("papers", [])
    
    ai_service = get_ai_service()
    
    messages.append({
        "role": "analyst",
        "content": f"Analyzing {len(patents)} patents and {len(papers)} papers",
        "status": "in_progress"
    })
    
    # Extract technologies from all content
    all_text = " ".join([
        p.get("abstract", "") or p.get("title", "")
        for p in patents + papers
    ])
    technologies = ai_service.extract_technologies(all_text)
    
    # Build tech stack
    tech_stack = {}
    for tech in technologies:
        tech_stack[tech] = {
            "name": tech,
            "patent_count": 0,
            "paper_count": 0,
            "intensity": 0.0,
        }
    
    # Count patents/papers per technology
    for patent in patents:
        patent_tech = patent.get("technologies", [])
        for tech in patent_tech:
            if tech in tech_stack:
                tech_stack[tech]["patent_count"] += 1
    
    for paper in papers:
        paper_tech = paper.get("technologies", [])
        for tech in paper_tech:
            if tech in tech_stack:
                tech_stack[tech]["paper_count"] += 1
    
    # Calculate intensity
    total_docs = len(patents) + len(papers)
    if total_docs > 0:
        for tech in tech_stack.values():
            tech["intensity"] = (tech["patent_count"] + tech["paper_count"]) / total_docs
    
    messages.append({
        "role": "analyst",
        "content": f"Identified {len(technologies)} technology domains",
        "status": "complete"
    })
    
    return {
        **state,
        "messages": messages,
        "tech_stack": tech_stack,
        "technologies": technologies,
        "current_step": "analyst_complete",
    }


def reporter_agent(state: AgentState) -> AgentState:
    """
    Synthesis & Reporting Agent (Reporter).
    Responsible for generating final reports and insights.
    
    This agent:
    - Synthesizes findings into coherent reports
    - Generates gap analysis comparisons
    - Produces actionable recommendations
    """
    entity_name = state.get("entity_name", "")
    messages = state.get("messages", [])
    tech_stack = state.get("tech_stack", {})
    patents = state.get("patents", [])
    papers = state.get("papers", [])
    
    messages.append({
        "role": "reporter",
        "content": "Generating analysis report",
        "status": "in_progress"
    })
    
    # Generate report summary
    report = {
        "entity_name": entity_name,
        "summary": f"Analysis of {entity_name}",
        "patent_count": len(patents),
        "paper_count": len(papers),
        "top_technologies": sorted(
            tech_stack.values(),
            key=lambda x: x.get("intensity", 0),
            reverse=True
        )[:5],
        "recommendations": [],
    }
    
    # Generate basic recommendations based on tech intensity
    if report["top_technologies"]:
        top_tech = report["top_technologies"][0]["name"]
        report["recommendations"].append(
            f"Primary focus area is {top_tech} - consider targeted collaboration"
        )
    
    if report["patent_count"] > 10:
        report["recommendations"].append(
            f"High patent activity ({report['patent_count']} patents) indicates strong IP portfolio"
        )
    
    messages.append({
        "role": "reporter",
        "content": f"Report generated with {len(report['recommendations'])} recommendations",
        "status": "complete"
    })
    
    return {
        **state,
        "messages": messages,
        "report": report,
        "current_step": "complete",
    }
