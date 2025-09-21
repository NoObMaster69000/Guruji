from sqlalchemy import Column, Integer, String, Text, JSON
from database import Base

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
