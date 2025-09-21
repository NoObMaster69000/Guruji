"""
Pydantic models for the FastAPI MCP Server.

This file contains all the data models for custom endpoints,
session management, and agent/tool discovery.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Internal Data Structures for Custom Session Management ---
class user_signup(BaseModel):
    name: str
    username: str
    email: str
    password: str

class user_login(BaseModel):
    login_identifier: str
    password: str

class ToolCall(BaseModel):
    """Model for a tool call made by an agent."""
    tool: str
    args: Dict[str, Any]
    result: Optional[str] = None

class Message(BaseModel):
    """Model for a single message in the chat history."""
    role: str  # "user" or "assistant"
    content: str
    agent_used: Optional[str] = None
    tool_calls: List[ToolCall] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class MessageCreate(Message):
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class NewSessionRequest(BaseModel):
    user_id: Optional[str] = None # Placeholder for now

# --- API Request/Response Models for Custom Endpoints ---

class NewSessionResponse(BaseModel):
    """Response for creating a new session."""
    session_id: str
    created_at: datetime

class ChatSessionInfo(BaseModel):
    """Model for returning basic chat session info."""
    id: str = Field(..., alias='session_id')
    title: str
    description: Optional[str] = None

class ChatRequest(BaseModel):
    """Request model for the /chat endpoint."""
    session_id: str
    message: str
    provider: str # e.g., 'Gemini', 'OpenAI'
    model: str # e.g., 'gemini-pro', 'gpt-4'
    temperature: float
    timeout: int
    max_tokens: int
    max_retries: int
    selected_kbs: List[str] = []

class ChatResponse(BaseModel):
    """Response model for the /chat endpoint."""
    reply: str
    agent_used: str
    tool_calls: List[ToolCall] = []
    timestamp: datetime

class HistoryResponse(BaseModel):
    """Response model for the /history/{session_id} endpoint."""
    session_id: str
    history: List[Message]

# --- Agent and Tool Discovery Models ---

class AgentDetail(BaseModel):
    """Model for describing an agent."""
    name: str
    description: str
    system_prompt: str

class AgentsListResponse(BaseModel):
    """Response model for listing available agents."""
    agents: List[AgentDetail]

class ToolDetail(BaseModel):
    """Model for describing a tool."""
    tool_name: str
    description: str
    schema_: Dict[str, Any] = Field(..., alias="schema")

class ToolsListResponse(BaseModel):
    """Response model for listing available tools."""
    tools: List[ToolDetail]

# --- Knowledge Base Models ---

class KnowledgeBaseBase(BaseModel):
    user_id: str
    kb_name: str
    vector_store: str
    allowed_file_types: List[str]
    parsing_library: str
    embedding_model: str
    chunking_strategy: str
    chunk_size: int
    chunk_overlap: int
    metadata_strategy: str

class KnowledgeBaseCreate(KnowledgeBaseBase):
    pass

class KnowledgeBase(KnowledgeBaseBase):
    id: int
    path: Optional[str] = None

    class Config:
        from_attributes = True

# --- Custom Tool Models ---

class CustomToolBase(BaseModel):
    name: str
    description: str
    code: str

class CustomToolCreate(CustomToolBase):
    pass

class CustomTool(CustomToolBase):
    id: int

    class Config:
        from_attributes = True

# --- Prompt Models ---

class PromptBase(BaseModel):
    name: str
    text: str

class PromptCreate(PromptBase):
    pass

class Prompt(PromptBase):
    id: int

    class Config:
        from_attributes = True

# --- Database Models ---
class DatabaseConnectionBase(BaseModel):
    name: str
    db_type: str
    host: str
    port: int
    username: str
    password: str

class DatabaseConnectionCreate(DatabaseConnectionBase):
    pass

class DatabaseConnection(DatabaseConnectionBase):
    id: int

    class Config:
        from_attributes = True

# --- Model Provider Settings Models ---

class ModelProviderSettingBase(BaseModel):
    provider: str
    api_key: str # This will be sent from frontend, but not always sent back
    model: str
    temperature: float
    max_tokens: int
    timeout: int
    max_retries: int

class ModelProviderSettingCreate(ModelProviderSettingBase):
    user_id: Optional[str] = None # Add user_id for saving
    pass

class ModelProviderSetting(ModelProviderSettingBase):
    id: int
    api_key: Optional[str] = None # Make API key optional when sending to frontend

    class Config:
        from_attributes = True
