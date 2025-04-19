from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    duration = Column(Integer)  # in minutes
    price = Column(Float)
    created_at = Column(DateTime, default=func.utcnow())
    updated_at = Column(DateTime, default=func.utcnow(), onupdate=func.utcnow()) 