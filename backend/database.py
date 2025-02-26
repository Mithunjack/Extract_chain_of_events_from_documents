import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from datetime import datetime

# Load env variables
load_dotenv()

# PostgreSQL Database URL
DATABASE_URL = os.getenv("DATABASE_URL")

# Connect to PostgreSQL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Event Model
class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    document_name = Column(String, nullable=False)
    event_title = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create the database tables
def init_db():
    Base.metadata.create_all(bind=engine)
