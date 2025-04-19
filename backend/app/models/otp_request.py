from sqlalchemy import Column, Integer, String, DateTime, func
from .base import Base

class OTPRequest(Base):
    __tablename__ = "otp_requests"

    id = Column(Integer, primary_key=True, index=True)
    contact = Column(String, nullable=False)
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    service = Column(String, nullable=False)
    datetime = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=func.now()) 