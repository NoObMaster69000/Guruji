import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get the directory of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database")
os.makedirs(DB_PATH, exist_ok=True)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(DB_PATH, 'guruji.db')}"
VECTOR_STORE_DIR = os.path.join(DB_PATH, "vector_stores")
os.makedirs(VECTOR_STORE_DIR, exist_ok=True)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
