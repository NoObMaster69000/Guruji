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

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from mcp.server.fastmcp import FastMCP
from sqlalchemy.orm import Session

import sql_models as sql_models
import models as models
from database import SessionLocal, engine, Base
from tools import add_tools
from agents import select_agent, get_agents_list, AgentDetail

# Create all tables
Base.metadata.create_all(bind=engine)

# --- Application Setup ---

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- In-Memory Storage ---
SESSIONS: Dict[str, List] = {}
SESSION_METADATA: Dict[str, datetime] = {}
SESSION_EXPIRATION = timedelta(hours=1)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. Create the MCP Server instance and add tools
mcp_server = FastMCP(
    name="AdvancedChatServer",
    instructions="A server with tools for calculation, web search, and getting the current time.",
)

# 2. Create the FastAPI application
app = FastAPI(
    title="Advanced MCP Server with Custom Endpoints",
    description="An MCP server mounted within a FastAPI app, with custom session and agent logic.",
    version="3.0.0",
)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    custom_tools = db.query(sql_models.CustomTool).all()
    custom_tools_dict = {tool.id: {"name": tool.name, "description": tool.description, "code": tool.code} for tool in custom_tools}
    add_tools(mcp_server, custom_tools_dict)
    db.close()

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

def get_session_history(session_id: str) -> List[models.Message]:
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

def run_agent_logic(agent: models.AgentDetail, message: str, selected_kbs: List[str], db: Session) -> Tuple[str, List[models.ToolCall]]:
    """
    Simulates the agent's logic to generate a reply and decide on tool calls.
    """
    if selected_kbs:
        logger.info(f"Selected Knowledge Bases: {selected_kbs}")
        response_parts = []
        for kb_id in selected_kbs:
            kb = db.query(sql_models.KnowledgeBase).filter(sql_models.KnowledgeBase.id == kb_id).first()
            if kb:
                response_parts.append(f"In knowledge base '{kb.kb_name}', I found the following information about '{message}': ...")
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
                # This is a default tool, so we can call it directly
                result = mcp_server._tool_manager.call_tool_by_name(tool_name, args)
                tool_calls.append(models.ToolCall(tool=tool_name, args=args, result=str(result)))
                return f"I've calculated that for you. {result}", tool_calls
        return "I can help with math. Please provide a simple expression like '123 + 456'.", []

    elif agent.name == "WebResearcher":
        tool_name = "web_search"
        args = {"query": message}
        result = mcp_server._tool_manager.call_tool_by_name(tool_name, args)
        tool_calls.append(models.ToolCall(tool=tool_name, args=args, result=str(result)))
        return f"Based on my web search: {result}", tool_calls

    elif agent.name == "Generalist":
        if "time" in message.lower():
            tool_name = "current_time"
            args = {}
            result = mcp_server._tool_manager.call_tool_by_name(tool_name, args)
            tool_calls.append(models.ToolCall(tool=tool_name, args=args, result=str(result)))
            return f"You asked about the time. {result}", tool_calls

        return f"As the Generalist, I can tell you: '{message}' is an interesting topic!", []

    return "I'm not sure how to respond to that.", []


# --- Custom FastAPI Endpoints ---

@app.post("/new-session", response_model=models.NewSessionResponse, tags=["Session Management"])
async def new_session():
    """Creates a new chat session."""
    session_id = str(uuid.uuid4())
    SESSIONS[session_id] = []
    SESSION_METADATA[session_id] = datetime.utcnow()
    logger.info(f"New session created: {session_id}")
    return models.NewSessionResponse(session_id=session_id, created_at=SESSION_METADATA[session_id])

@app.post("/chat", response_model=models.ChatResponse, tags=["Chat"])
async def chat(request: models.ChatRequest, db: Session = Depends(get_db)):
    """Handles a user message and returns an agent's reply."""
    history = get_session_history(request.session_id)

    # 1. Add user message to history
    user_message = models.Message(role="user", content=request.message)
    history.append(user_message)

    # 2. Select agent and run logic
    agent = select_agent(request.message, request.agent)
    reply_content, tool_calls = run_agent_logic(agent, request.message, request.selected_kbs, db)

    # 3. Add assistant reply to history
    assistant_message = models.Message(
        role="assistant",
        content=reply_content,
        agent_used=agent.name,
        tool_calls=tool_calls,
    )
    history.append(assistant_message)

    logger.info(f"Session {request.session_id}: Agent '{agent.name}' replied.")

    return models.ChatResponse(
        reply=reply_content,
        agent_used=agent.name,
        tool_calls=tool_calls,
        timestamp=assistant_message.timestamp
    )

@app.get("/history/{session_id}", response_model=models.HistoryResponse, tags=["Session Management"])
async def get_history(session_id: str):
    """Retrieves the full chat history for a session."""
    history = get_session_history(session_id)
    return models.HistoryResponse(session_id=session_id, history=history)

@app.get("/agents", response_model=models.AgentsListResponse, tags=["Discovery"])
async def list_agents():
    """Lists all available agents."""
    return models.AgentsListResponse(agents=get_agents_list())

@app.get("/tools", response_model=models.ToolsListResponse, tags=["Discovery"])
async def list_tools(db: Session = Depends(get_db)):
    """Lists all available tools and their schemas."""
    # TODO: This needs to be reimplemented to load tools from DB
    tools = await mcp_server.list_tools()
    tools_list = [
        models.ToolDetail(
            tool_name=tool.name,
            description=tool.description or "",
            schema=tool.inputSchema,
        )
        for tool in tools
    ]
    return models.ToolsListResponse(tools=tools_list)

@app.post("/tools/create", response_model=models.CustomTool, tags=["Tools Hub"])
def create_custom_tool(tool: models.CustomToolCreate, db: Session = Depends(get_db)):
    db_tool = sql_models.CustomTool(**tool.dict())
    db.add(db_tool)
    db.commit()
    db.refresh(db_tool)
    return db_tool

@app.get("/tools/{tool_id}", response_model=models.CustomTool, tags=["Tools Hub"])
def get_custom_tool(tool_id: int, db: Session = Depends(get_db)):
    db_tool = db.query(sql_models.CustomTool).filter(sql_models.CustomTool.id == tool_id).first()
    if db_tool is None:
        raise HTTPException(status_code=404, detail="Custom tool not found")
    return db_tool

@app.put("/tools/{tool_id}", response_model=models.CustomTool, tags=["Tools Hub"])
def update_custom_tool(tool_id: int, tool: models.CustomToolCreate, db: Session = Depends(get_db)):
    db_tool = db.query(sql_models.CustomTool).filter(sql_models.CustomTool.id == tool_id).first()
    if db_tool is None:
        raise HTTPException(status_code=404, detail="Custom tool not found")
    for var, value in vars(tool).items():
        setattr(db_tool, var, value) if value else None
    db.add(db_tool)
    db.commit()
    db.refresh(db_tool)
    return db_tool

@app.delete("/tools/{tool_id}", tags=["Tools Hub"])
def delete_custom_tool(tool_id: int, db: Session = Depends(get_db)):
    db_tool = db.query(sql_models.CustomTool).filter(sql_models.CustomTool.id == tool_id).first()
    if db_tool is None:
        raise HTTPException(status_code=404, detail="Custom tool not found")
    db.delete(db_tool)
    db.commit()
    return {"message": f"Custom tool {tool_id} deleted successfully"}


@app.post("/kb/create", response_model=models.KnowledgeBase, tags=["Knowledge Base"])
def create_knowledge_base(kb: models.KnowledgeBaseCreate, db: Session = Depends(get_db)):
    db_kb = sql_models.KnowledgeBase(**kb.dict())
    db.add(db_kb)
    db.commit()
    db.refresh(db_kb)
    return db_kb

@app.get("/kb/list", response_model=List[models.KnowledgeBase], tags=["Knowledge Base"])
def list_knowledge_bases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    kbs = db.query(sql_models.KnowledgeBase).offset(skip).limit(limit).all()
    return kbs

@app.get("/kb/{kb_id}", response_model=models.KnowledgeBase, tags=["Knowledge Base"])
def get_knowledge_base(kb_id: int, db: Session = Depends(get_db)):
    db_kb = db.query(sql_models.KnowledgeBase).filter(sql_models.KnowledgeBase.id == kb_id).first()
    if db_kb is None:
        raise HTTPException(status_code=404, detail="Knowledge Base not found")
    return db_kb

@app.put("/kb/{kb_id}", response_model=models.KnowledgeBase, tags=["Knowledge Base"])
def update_knowledge_base(kb_id: int, kb: models.KnowledgeBaseCreate, db: Session = Depends(get_db)):
    db_kb = db.query(sql_models.KnowledgeBase).filter(sql_models.KnowledgeBase.id == kb_id).first()
    if db_kb is None:
        raise HTTPException(status_code=404, detail="Knowledge Base not found")
    for var, value in vars(kb).items():
        setattr(db_kb, var, value) if value else None
    db.add(db_kb)
    db.commit()
    db.refresh(db_kb)
    return db_kb

@app.delete("/kb/{kb_id}", tags=["Knowledge Base"])
def delete_knowledge_base(kb_id: int, db: Session = Depends(get_db)):
    db_kb = db.query(sql_models.KnowledgeBase).filter(sql_models.KnowledgeBase.id == kb_id).first()
    if db_kb is None:
        raise HTTPException(status_code=404, detail="Knowledge Base not found")
    db.delete(db_kb)
    db.commit()
    return {"message": f"Knowledge Base {kb_id} deleted successfully"}


@app.post("/databases/create", response_model=models.DatabaseConnection, tags=["Database Hub"])
def create_database_connection(db_conn: models.DatabaseConnectionCreate, db: Session = Depends(get_db)):
    db_db_conn = sql_models.DatabaseConnection(**db_conn.dict())
    db.add(db_db_conn)
    db.commit()
    db.refresh(db_db_conn)
    return db_db_conn

@app.get("/databases/list", response_model=List[models.DatabaseConnection], tags=["Database Hub"])
def list_database_connections(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    db_conns = db.query(sql_models.DatabaseConnection).offset(skip).limit(limit).all()
    return db_conns

@app.get("/databases/{db_id}", response_model=models.DatabaseConnection, tags=["Database Hub"])
def get_database_connection(db_id: int, db: Session = Depends(get_db)):
    db_db_conn = db.query(sql_models.DatabaseConnection).filter(sql_models.DatabaseConnection.id == db_id).first()
    if db_db_conn is None:
        raise HTTPException(status_code=404, detail="Database connection not found")
    return db_db_conn

@app.put("/databases/{db_id}", response_model=models.DatabaseConnection, tags=["Database Hub"])
def update_database_connection(db_id: int, db_conn: models.DatabaseConnectionCreate, db: Session = Depends(get_db)):
    db_db_conn = db.query(sql_models.DatabaseConnection).filter(sql_models.DatabaseConnection.id == db_id).first()
    if db_db_conn is None:
        raise HTTPException(status_code=404, detail="Database connection not found")
    for var, value in vars(db_conn).items():
        setattr(db_db_conn, var, value) if value else None
    db.add(db_db_conn)
    db.commit()
    db.refresh(db_db_conn)
    return db_db_conn

@app.delete("/databases/{db_id}", tags=["Database Hub"])
def delete_database_connection(db_id: int, db: Session = Depends(get_db)):
    db_db_conn = db.query(sql_models.DatabaseConnection).filter(sql_models.DatabaseConnection.id == db_id).first()
    if db_db_conn is None:
        raise HTTPException(status_code=404, detail="Database connection not found")
    db.delete(db_db_conn)
    db.commit()
    return {"message": f"Database connection {db_id} deleted successfully"}


@app.post("/prompts/create", response_model=models.Prompt, tags=["Prompt Hub"])
def create_prompt(prompt: models.PromptCreate, db: Session = Depends(get_db)):
    db_prompt = sql_models.Prompt(**prompt.dict())
    db.add(db_prompt)
    db.commit()
    db.refresh(db_prompt)
    return db_prompt

@app.get("/prompts/list", response_model=List[models.Prompt], tags=["Prompt Hub"])
def list_prompts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    prompts = db.query(sql_models.Prompt).offset(skip).limit(limit).all()
    return prompts

@app.get("/prompts/{prompt_id}", response_model=models.Prompt, tags=["Prompt Hub"])
def get_prompt(prompt_id: int, db: Session = Depends(get_db)):
    db_prompt = db.query(sql_models.Prompt).filter(sql_models.Prompt.id == prompt_id).first()
    if db_prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return db_prompt

@app.put("/prompts/{prompt_id}", response_model=models.Prompt, tags=["Prompt Hub"])
def update_prompt(prompt_id: int, prompt: models.PromptCreate, db: Session = Depends(get_db)):
    db_prompt = db.query(sql_models.Prompt).filter(sql_models.Prompt.id == prompt_id).first()
    if db_prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    for var, value in vars(prompt).items():
        setattr(db_prompt, var, value) if value else None
    db.add(db_prompt)
    db.commit()
    db.refresh(db_prompt)
    return db_prompt

@app.delete("/prompts/{prompt_id}", tags=["Prompt Hub"])
def delete_prompt(prompt_id: int, db: Session = Depends(get_db)):
    db_prompt = db.query(sql_models.Prompt).filter(sql_models.Prompt.id == prompt_id).first()
    if db_prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    db.delete(db_prompt)
    db.commit()
    return {"message": f"Prompt {prompt_id} deleted successfully"}
