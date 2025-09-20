"""
Refactored main FastAPI application for the MCP server.

This version uses the `mcp` SDK, re-introduces session management,
and restores all originally requested endpoints.
"""
import re
import uuid
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Tuple

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mcp.server.fastmcp import FastMCP

from models import (
    Message, ToolCall, NewSessionResponse, ChatRequest, ChatResponse,
    HistoryResponse, AgentsListResponse, ToolsListResponse, ToolDetail,
    KnowledgeBaseRequest, KnowledgeBase, CustomTool, CustomToolCreate,
    DatabaseConnection, DatabaseConnectionCreate
)
from tools import add_tools
from agents import select_agent, get_agents_list, AgentDetail

# --- Application Setup ---

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- In-Memory Storage ---
SESSIONS: Dict[str, List[Message]] = {}
SESSION_METADATA: Dict[str, datetime] = {}
SESSION_EXPIRATION = timedelta(hours=1)

KNOWLEDGE_BASES: Dict[str, Dict] = {}
CUSTOM_TOOLS: Dict[str, Dict] = {}
DATABASES: Dict[str, Dict] = {}

# 1. Create the MCP Server instance and add tools
mcp_server = FastMCP(
    name="AdvancedChatServer",
    instructions="A server with tools for calculation, web search, and getting the current time.",
)
add_tools(mcp_server, CUSTOM_TOOLS)

# 2. Create the FastAPI application
app = FastAPI(
    title="Advanced MCP Server with Custom Endpoints",
    description="An MCP server mounted within a FastAPI app, with custom session and agent logic.",
    version="3.0.0",
)

# 3. Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Mcp-Session-Id"],
)

# 4. Mount the MCP server's ASGI app
# A compliant MCP client would connect to this endpoint (e.g., http://localhost:8000/mcp)
app.mount("/mcp", mcp_server.streamable_http_app())

def get_session_history(session_id: str) -> List[Message]:
    """Retrieves a session history or raises HTTPException if not found or expired."""
    if session_id not in SESSIONS or session_id not in SESSION_METADATA:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")

    last_accessed = SESSION_METADATA[session_id]
    if datetime.utcnow() - last_accessed > SESSION_EXPIRATION:
        del SESSIONS[session_id]
        del SESSION_METADATA[session_id]
        raise HTTPException(status_code=404, detail="Session has expired.")

    SESSION_METADATA[session_id] = datetime.utcnow()
    return SESSIONS[session_id]

# --- Mock Agent and Tool-Calling Logic ---

def run_agent_logic(agent: AgentDetail, message: str, selected_kbs: List[str]) -> Tuple[str, List[ToolCall]]:
    """
    Simulates the agent's logic to generate a reply and decide on tool calls.
    """
    if selected_kbs:
        logger.info(f"Selected Knowledge Bases: {selected_kbs}")
        response_parts = []
        for kb_id in selected_kbs:
            if kb_id in KNOWLEDGE_BASES:
                kb = KNOWLEDGE_BASES[kb_id]
                response_parts.append(f"In knowledge base '{kb['kb_name']}', I found the following information about '{message}': ...")
        if response_parts:
            return "\n".join(response_parts), []
        else:
            return f"I could not find any information about '{message}' in the selected knowledge bases.", []


    tool_calls = []

    # A map to connect agent names to their primary tool
    agent_tool_map = {
        "MathWhiz": "calculator",
        "WebResearcher": "web_search",
        "Generalist": "current_time",
    }

    if agent.name == "MathWhiz":
        match = re.search(r'(\d+\.?\d*)\s*([\+\-\*\/])\s*(\d+\.?\d*)', message)
        if match:
            a, op_symbol, b = match.groups()
            op_map = {"+": "add", "-": "subtract", "*": "multiply", "/": "divide"}
            op = op_map.get(op_symbol)
            if op:
                tool_name = "calculator"
                args = {"a": float(a), "b": float(b), "op": op}
                result = mcp_server.tools[tool_name].wrapped(**args)
                tool_calls.append(ToolCall(tool=tool_name, args=args, result=result))
                return f"I've calculated that for you. {result}", tool_calls
        return "I can help with math. Please provide a simple expression like '123 + 456'.", []

    elif agent.name == "WebResearcher":
        tool_name = "web_search"
        args = {"query": message}
        result = mcp_server.tools[tool_name].wrapped(**args)
        tool_calls.append(ToolCall(tool=tool_name, args=args, result=result))
        return f"Based on my web search: {result}", tool_calls

    elif agent.name == "Generalist":
        if "time" in message.lower():
            tool_name = "current_time"
            args = {}
            result = mcp_server.tools[tool_name].wrapped(**args)
            tool_calls.append(ToolCall(tool=tool_name, args=args, result=result))
            return f"You asked about the time. {result}", tool_calls

        return f"As the Generalist, I can tell you: '{message}' is an interesting topic!", []

    return "I'm not sure how to respond to that.", []


# --- Custom FastAPI Endpoints ---

@app.post("/new-session", response_model=NewSessionResponse, tags=["Session Management"])
async def new_session():
    """Creates a new chat session."""
    session_id = str(uuid.uuid4())
    SESSIONS[session_id] = []
    SESSION_METADATA[session_id] = datetime.utcnow()
    logger.info(f"New session created: {session_id}")
    return NewSessionResponse(session_id=session_id, created_at=SESSION_METADATA[session_id])

@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest):
    """Handles a user message and returns an agent's reply."""
    history = get_session_history(request.session_id)

    # 1. Add user message to history
    user_message = Message(role="user", content=request.message)
    history.append(user_message)

    # 2. Select agent and run logic
    agent = select_agent(request.message, request.agent)
    reply_content, tool_calls = run_agent_logic(agent, request.message, request.selected_kbs)

    # 3. Add assistant reply to history
    assistant_message = Message(
        role="assistant",
        content=reply_content,
        agent_used=agent.name,
        tool_calls=tool_calls,
    )
    history.append(assistant_message)

    logger.info(f"Session {request.session_id}: Agent '{agent.name}' replied.")

    return ChatResponse(
        reply=reply_content,
        agent_used=agent.name,
        tool_calls=tool_calls,
        timestamp=assistant_message.timestamp
    )

@app.get("/history/{session_id}", response_model=HistoryResponse, tags=["Session Management"])
async def get_history(session_id: str):
    """Retrieves the full chat history for a session."""
    history = get_session_history(session_id)
    return HistoryResponse(session_id=session_id, history=history)

@app.get("/agents", response_model=AgentsListResponse, tags=["Discovery"])
async def list_agents():
    """Lists all available agents."""
    return AgentsListResponse(agents=get_agents_list())

@app.get("/tools", response_model=ToolsListResponse, tags=["Discovery"])
async def list_tools():
    """Lists all available tools and their schemas."""
    tools = await mcp_server.list_tools()
    tools_list = [
        ToolDetail(
            tool_name=tool.name,
            description=tool.description or "",
            schema=tool.inputSchema,
        )
        for tool in tools
    ]
    return ToolsListResponse(tools=tools_list)

@app.post("/tools/create", tags=["Tools Hub"])
async def create_custom_tool(request: CustomToolCreate):
    """Creates a new custom tool."""
    tool_id = str(uuid.uuid4())
    CUSTOM_TOOLS[tool_id] = request.dict()
    # Re-register tools
    add_tools(mcp_server, CUSTOM_TOOLS)
    logger.info(f"New custom tool created: {request.name} (ID: {tool_id})")
    return {"message": "Custom tool created successfully", "tool_id": tool_id, "data": request.dict()}

@app.get("/tools/{tool_id}", response_model=CustomTool, tags=["Tools Hub"])
async def get_custom_tool(tool_id: str):
    """Retrieves a single custom tool by its ID."""
    if tool_id not in CUSTOM_TOOLS:
        raise HTTPException(status_code=404, detail="Custom tool not found.")
    return CustomTool(id=tool_id, **CUSTOM_TOOLS[tool_id])

@app.put("/tools/{tool_id}", tags=["Tools Hub"])
async def update_custom_tool(tool_id: str, request: CustomToolCreate):
    """Updates an existing custom tool."""
    if tool_id not in CUSTOM_TOOLS:
        raise HTTPException(status_code=404, detail="Custom tool not found.")
    CUSTOM_TOOLS[tool_id] = request.dict()
    # Re-register tools
    add_tools(mcp_server, CUSTOM_TOOLS)
    logger.info(f"Custom tool {tool_id} updated: {request.name}")
    return {"message": "Custom tool updated successfully", "tool_id": tool_id, "data": request.dict()}

@app.delete("/tools/{tool_id}", tags=["Tools Hub"])
async def delete_custom_tool(tool_id: str):
    """Deletes a custom tool."""
    if tool_id not in CUSTOM_TOOLS:
        raise HTTPException(status_code=404, detail="Custom tool not found.")
    del CUSTOM_TOOLS[tool_id]
    # Re-register tools
    add_tools(mcp_server, CUSTOM_TOOLS)
    logger.info(f"Custom tool {tool_id} deleted.")
    return {"message": "Custom tool deleted successfully", "tool_id": tool_id}

@app.post("/kb/create", tags=["Knowledge Base"])
async def create_knowledge_base(request: KnowledgeBaseRequest):
    """Creates a new Knowledge Base configuration."""
    kb_id = str(uuid.uuid4())
    KNOWLEDGE_BASES[kb_id] = request.dict()
    logger.info(f"New Knowledge Base created: {request.kb_name} (ID: {kb_id})")
    return {"message": "Knowledge Base created successfully", "kb_id": kb_id, "data": request.dict()}

@app.get("/kb/list", tags=["Knowledge Base"])
async def list_knowledge_bases():
    """Lists all available Knowledge Bases."""
    return [{"id": kb_id, **kb_data} for kb_id, kb_data in KNOWLEDGE_BASES.items()]

@app.get("/kb/{kb_id}", response_model=KnowledgeBase, tags=["Knowledge Base"])
async def get_knowledge_base(kb_id: str):
    """Retrieves a single Knowledge Base by its ID."""
    if kb_id not in KNOWLEDGE_BASES:
        raise HTTPException(status_code=404, detail="Knowledge Base not found.")
    return KnowledgeBase(id=kb_id, **KNOWLEDGE_BASES[kb_id])

@app.put("/kb/{kb_id}", tags=["Knowledge Base"])
async def update_knowledge_base(kb_id: str, request: KnowledgeBaseRequest):
    """Updates an existing Knowledge Base."""
    if kb_id not in KNOWLEDGE_BASES:
        raise HTTPException(status_code=404, detail="Knowledge Base not found.")
    KNOWLEDGE_BASES[kb_id] = request.dict()
    logger.info(f"Knowledge Base {kb_id} updated: {request.kb_name}")
    return {"message": "Knowledge Base updated successfully", "kb_id": kb_id, "data": request.dict()}

@app.delete("/kb/{kb_id}", tags=["Knowledge Base"])
async def delete_knowledge_base(kb_id: str):
    """Deletes a Knowledge Base."""
    if kb_id not in KNOWLEDGE_BASES:
        raise HTTPException(status_code=404, detail="Knowledge Base not found.")
    del KNOWLEDGE_BASES[kb_id]
    logger.info(f"Knowledge Base {kb_id} deleted.")
    return {"message": "Knowledge Base deleted successfully", "kb_id": kb_id}

# --- Database Hub Endpoints ---

@app.post("/databases/create", tags=["Database Hub"])
async def create_database_connection(request: DatabaseConnectionCreate):
    """Creates a new database connection configuration."""
    db_id = str(uuid.uuid4())
    DATABASES[db_id] = request.dict()
    logger.info(f"New database connection created: {request.name} (ID: {db_id})")
    return {"message": "Database connection created successfully", "db_id": db_id, "data": request.dict()}

@app.get("/databases/list", tags=["Database Hub"])
async def list_database_connections():
    """Lists all available database connections."""
    return [{"id": db_id, **db_data} for db_id, db_data in DATABASES.items()]

@app.get("/databases/{db_id}", response_model=DatabaseConnection, tags=["Database Hub"])
async def get_database_connection(db_id: str):
    """Retrieves a single database connection by its ID."""
    if db_id not in DATABASES:
        raise HTTPException(status_code=404, detail="Database connection not found.")
    return DatabaseConnection(id=db_id, **DATABASES[db_id])

@app.put("/databases/{db_id}", tags=["Database Hub"])
async def update_database_connection(db_id: str, request: DatabaseConnectionCreate):
    """Updates an existing database connection."""
    if db_id not in DATABASES:
        raise HTTPException(status_code=404, detail="Database connection not found.")
    DATABASES[db_id] = request.dict()
    logger.info(f"Database connection {db_id} updated: {request.name}")
    return {"message": "Database connection updated successfully", "db_id": db_id, "data": request.dict()}

@app.delete("/databases/{db_id}", tags=["Database Hub"])
async def delete_database_connection(db_id: str):
    """Deletes a database connection."""
    if db_id not in DATABASES:
        raise HTTPException(status_code=404, detail="Database connection not found.")
    del DATABASES[db_id]
    logger.info(f"Database connection {db_id} deleted.")
    return {"message": "Database connection deleted successfully", "db_id": db_id}
