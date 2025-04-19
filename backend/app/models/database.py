from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Boolean, ForeignKey, func, Date, Time
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import os
from passlib.context import CryptContext

# Use SQLite for development
SQLALCHEMY_DATABASE_URL = "sqlite:///./salon.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class OTP(Base):
    __tablename__ = "otp"
    id = Column(Integer, primary_key=True)
    contact = Column(String)
    code = Column(String)
    expires_at = Column(DateTime)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    price = Column(Float)
    duration = Column(Integer)  # in minutes

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String)
    phone = Column(String)
    date = Column(Date)
    time = Column(Time)
    service = Column(String)
    hair_artist_id = Column(Integer, ForeignKey("hair_artists.id"))
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

class HairArtist(Base):
    __tablename__ = "hair_artists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

    def verify_password(self, password: str):
        return pwd_context.verify(password, self.hashed_password)

    def get_password_hash(self, password: str):
        return pwd_context.hash(password)

# Create all tables
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 