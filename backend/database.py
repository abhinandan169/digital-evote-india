"""
SQL Database Connector for Digital e-Vote System using SQLAlchemy ORM.
Supports SQLite (default local file) and PostgreSQL / MySQL via DATABASE_URL.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./evote_elections.db")

# For SQLite, enable check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency generator for FastAPI route database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
