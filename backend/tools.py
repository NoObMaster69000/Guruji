"""
Refactored tooling system using the MCP SDK.

This module defines the tools for the server and provides a function
to register them with a FastMCP server instance.
"""
import time
from datetime import datetime
from typing import Literal, Dict, Any
import logging

from mcp.server.fastmcp import FastMCP

logger = logging.getLogger(__name__)

# --- Default Tool Definitions ---

def calculator(
    a: float,
    b: float,
    op: Literal["add", "subtract", "multiply", "divide"],
) -> str:
    """
    Performs a basic arithmetic calculation.

    :param a: The first number.
    :param b: The second number.
    :param op: The operation to perform.
    """
    time.sleep(0.5)  # Simulate work
    if op == "add":
        result = a + b
    elif op == "subtract":
        result = a - b
    elif op == "multiply":
        result = a * b
    elif op == "divide":
        if b == 0:
            return "Error: Division by zero."
        result = a / b
    else:
        # This case should not be reachable due to the Literal type hint
        return f"Error: Unknown operation '{op}'."
    return f"The result is {result}"

def web_search(query: str) -> str:
    """
    Performs a mock web search and returns a summary.

    :param query: The search query.
    """
    time.sleep(1.0)  # Simulate work
    return f"Mock search results for '{query}': The topic is complex, with many perspectives. Key findings suggest a correlation but no definitive causation."

def current_time() -> str:
    """
    Returns the current date and time as a formatted string.
    """
    time.sleep(0.2)  # Simulate work
    return f"The current time is {datetime.now().isoformat()}"


def add_tools(mcp: FastMCP, custom_tools: Dict[str, Dict] = None):
    """
    Adds all the tools to the given FastMCP server instance.
    """
    # HACK: Clear existing tools before re-registering.
    # This is necessary because the FastMCP library does not provide a public
    # method to clear tools, and we need to re-register them to add/update/delete
    # custom tools.
    if hasattr(mcp, '_tool_manager') and hasattr(mcp._tool_manager, '_tools'):
        mcp._tool_manager._tools = {}

    # Register default tools
    mcp.add_tool(calculator)
    mcp.add_tool(web_search)
    mcp.add_tool(current_time)

    # Add custom tools
    if custom_tools:
        for tool_id, tool_data in custom_tools.items():
            try:
                # DANGER: Using exec is a security risk if the code is not trusted.
                # Here we are assuming the code is provided by a trusted user.
                # A more secure implementation would use a sandboxed environment
                # or a restricted subset of Python.
                tool_code = tool_data['code']
                tool_name = tool_data['name']

                # Create a scope for the exec call
                local_scope = {}
                exec(tool_code, globals(), local_scope)

                # The function should be defined in the local_scope
                # We assume the code defines a single function
                func = next(iter(local_scope.values()))

                # Register the function as a tool
                mcp.add_tool(func, name=tool_name)
                logger.info(f"Successfully registered custom tool: {tool_name}")

            except Exception as e:
                logger.error(f"Failed to register custom tool '{tool_data.get('name', 'unknown')}': {e}")
