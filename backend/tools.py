"""
Refactored tooling system using the MCP SDK.

This module defines the tools for the server and provides a function
to register them with a FastMCP server instance.
"""
import time
from datetime import datetime
from typing import Literal

from mcp.server.fastmcp import FastMCP

def add_tools(mcp: FastMCP):
    """
    Adds all the tools to the given FastMCP server instance.
    """

    @mcp.tool()
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

    @mcp.tool()
    def web_search(query: str) -> str:
        """
        Performs a mock web search and returns a summary.

        :param query: The search query.
        """
        time.sleep(1.0)  # Simulate work
        return f"Mock search results for '{query}': The topic is complex, with many perspectives. Key findings suggest a correlation but no definitive causation."

    @mcp.tool()
    def current_time() -> str:
        """
        Returns the current date and time as a formatted string.
        """
        time.sleep(0.2)  # Simulate work
        return f"The current time is {datetime.now().isoformat()}"
