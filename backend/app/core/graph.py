"""
LangGraph State and Workflow definitions.
"""
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END


class AgentState(TypedDict):
    """State shared between agents in the graph."""
    # Input
    entity_name: str
    entity_id: str
    
    # Data collected
    patents: List[Dict[str, Any]]
    papers: List[Dict[str, Any]]
    personnel: List[Dict[str, Any]]
    
    # Analysis results
    tech_stack: Dict[str, Any]
    technologies: List[str]
    
    # Output
    report: Dict[str, Any]
    messages: List[Dict[str, str]]
    current_step: str


def create_analysis_graph() -> StateGraph:
    """
    Create the LangGraph workflow for entity analysis.
    
    Flow: scout -> analyst -> reporter -> END
    """
    from app.agents.agents import scout_agent, analyst_agent, reporter_agent
    
    # Create the graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("scout", scout_agent)
    workflow.add_node("analyst", analyst_agent)
    workflow.add_node("reporter", reporter_agent)
    
    # Define edges
    workflow.set_entry_point("scout")
    workflow.add_edge("scout", "analyst")
    workflow.add_edge("analyst", "reporter")
    workflow.add_edge("reporter", END)
    
    return workflow.compile()


# Compiled graph for import
analysis_graph = None


def get_analysis_graph():
    """Get or create the analysis graph."""
    global analysis_graph
    if analysis_graph is None:
        analysis_graph = create_analysis_graph()
    return analysis_graph
