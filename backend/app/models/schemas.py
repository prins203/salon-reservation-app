from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

class BookingRequest(BaseModel):
    name: str
    contact: str
    service: str
    datetime: datetime

class OTPRequest(BaseModel):
    contact: str
    code: str
    name: str
    service: str
    datetime: datetime

class Service(BaseModel):
    id: int
    name: str
    duration: int  # in minutes
    price: float

class TimeSlot(BaseModel):
    start_time: datetime
    end_time: datetime
    available: bool

class BookingResponse(BaseModel):
    id: int
    name: str
    contact: str
    service: str
    datetime: datetime
    status: str
    created_at: datetime

    class Config:
        from_attributes = True 