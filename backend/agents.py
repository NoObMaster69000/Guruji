"""
Agent definitions and routing logic for the MCP Server.
"""
import re
from typing import List, Optional

from backend.models import AgentDetail

# Agent Definitions
AGENTS = {
    "Generalist": AgentDetail(
        name="Generalist",
        description="A helpful general assistant for everyday questions.",
        system_prompt="You are a helpful general assistant. Be friendly and concise.",
    ),
    "MathWhiz": AgentDetail(
        name="MathWhiz",
        description="A specialist for solving mathematical problems.",
        system_prompt="You are a mathematical genius. You must use the calculator tool to solve problems.",
    ),
    "WebResearcher": AgentDetail(
        name="WebResearcher",
        description="A specialist for finding information on the web.",
        system_prompt="You are a diligent web researcher. You must use the web_search tool to find information.",
    ),
}

def get_agents_list() -> List[AgentDetail]:
    """Returns a list of all available agent details."""
    return list(AGENTS.values())

def select_agent(message: str, requested_agent: Optional[str] = None) -> AgentDetail:
    """
    Selects the appropriate agent based on the user's message or request.
    """
    if requested_agent and requested_agent in AGENTS:
        return AGENTS[requested_agent]

    # Simple rule-based routing
    if re.search(r'\b(calculate|plus|minus|times|divided by|\+|\-|\*|\/)\b', message, re.IGNORECASE):
        return AGENTS["MathWhiz"]
    if re.search(r'\b(search|find|what is|who is|tell me about)\b', message, re.IGNORECASE):
        return AGENTS["WebResearcher"]

    return AGENTS["Generalist"]
