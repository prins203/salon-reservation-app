from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import os

# Use SQLite for development
SQLALCHEMY_DATABASE_URL = "sqlite:///./salon.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class OTP(Base):
    __tablename__ = "otp"
    id = Column(Integer, primary_key=True)
    contact = Column(String)
    code = Column(String)
    expires_at = Column(DateTime)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

class Booking(Base):
    __tablename__ = "booking"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    contact = Column(String)
    service = Column(String)
    datetime = Column(DateTime)
    status = Column(String, default="confirmed")
    created_at = Column(DateTime, default=func.now())

# Create all tables
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 