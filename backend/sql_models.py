from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class user_registry(Base):
    __tablename__ = "user_registry"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String) # In a real application, store hashed passwords!

class KnowledgeBase(Base):
    __tablename__ = "knowledge_bases"

    id = Column(Integer, primary_key=True, index=True)
    kb_name = Column(String, index=True)
    vector_store = Column(String)
    allowed_file_types = Column(JSON)
    parsing_library = Column(String)
    chunking_strategy = Column(String)
    chunk_size = Column(Integer)
    chunk_overlap = Column(Integer)
    metadata_strategy = Column(String)
    path = Column(String) # Path to the persisted vector store

class CustomTool(Base):
    __tablename__ = "custom_tools"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    code = Column(Text)

class DatabaseConnection(Base):
    __tablename__ = "database_connections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    db_type = Column(String)
    host = Column(String)
    port = Column(Integer)
    username = Column(String)
    password = Column(String)

class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    text = Column(Text)

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    title = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    messages = relationship("ChatMessage", back_populates="session")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.session_id"))
    role = Column(String)
    content = Column(Text)
    agent_used = Column(String, nullable=True)
    tool_calls = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    session = relationship("ChatSession", back_populates="messages")
