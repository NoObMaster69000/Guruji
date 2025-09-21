from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, DateTime, Uuid, CHAR
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import uuid


class user_registry(Base):
    __tablename__ = "user_registry"

    # Use Uuid for the primary key
    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String) # In a real application, store hashed passwords!

class KnowledgeBase(Base):
    __tablename__ = "knowledge_bases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(CHAR(36), ForeignKey("user_registry.id"), nullable=False)
    user = relationship("user_registry")
    kb_name = Column(String, index=True)
    vector_store = Column(String)
    allowed_file_types = Column(JSON)
    parsing_library = Column(String)
    embedding_model = Column(String)
    chunking_strategy = Column(String)
    chunk_size = Column(Integer)
    chunk_overlap = Column(Integer)
    metadata_strategy = Column(String)
    path = Column(String) # Path to the persisted vector store

class CustomTool(Base):
    __tablename__ = "custom_tools"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(CHAR(36), ForeignKey("user_registry.id"))
    user = relationship("user_registry")
    name = Column(String, index=True)
    description = Column(Text)
    code = Column(Text)

class DatabaseConnection(Base):
    __tablename__ = "database_connections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(CHAR(36), ForeignKey("user_registry.id"))
    name = Column(String, index=True)
    db_type = Column(String)
    host = Column(String)
    port = Column(Integer)
    username = Column(String)
    password = Column(String)

class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(CHAR(36), ForeignKey("user_registry.id"))
    name = Column(String, index=True)
    text = Column(Text)
    

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    # Add user_id and relationship
    user_id = Column(CHAR(36), ForeignKey("user_registry.id"), nullable=False)
    user = relationship("user_registry")
    session_id = Column(String, unique=True, index=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    messages = relationship("ChatMessage", back_populates="session")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    # Add user_id and relationship
    user_id = Column(CHAR(36), ForeignKey("user_registry.id"), nullable=False)
    user = relationship("user_registry")
    session_id = Column(String, ForeignKey("chat_sessions.session_id"))
    role = Column(String)
    content = Column(Text)
    agent_used = Column(String, nullable=True)
    tool_calls = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    session = relationship("ChatSession", back_populates="messages")

class ModelProviderSetting(Base):
    __tablename__ = "model_provider_settings"

    id = Column(Integer, primary_key=True, index=True)
    # Add user_id and relationship
    user_id = Column(CHAR(36), ForeignKey("user_registry.id"), nullable=False)
    user = relationship("user_registry")
    provider = Column(String, nullable=False)
    api_key = Column(String, nullable=False)
    model = Column(String, nullable=False)
    temperature = Column(Integer, nullable=False, default=0.5)
    max_tokens = Column(Integer, nullable=False, default=1024)
    timeout = Column(Integer, nullable=False, default=120)
    max_retries = Column(Integer, nullable=False, default=2)
