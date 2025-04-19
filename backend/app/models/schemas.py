from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

class BookingRequest(BaseModel):
    name: str
    contact: str
    service: str
    date: str
    time: str
    hair_artist_id: int

class OTPRequest(BaseModel):
    contact: str
    code: str
    name: str
    service: str
    date: str
    time: str
    hair_artist_id: int

class ServiceBase(BaseModel):
    name: str
    description: str
    duration: int  # in minutes
    price: float

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class TimeSlot(BaseModel):
    start_time: datetime
    end_time: datetime
    available: bool

class BookingResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    date: str
    time: str
    service: str
    hair_artist_id: int
    status: str

    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    name: str
    email: str
    phone: str
    date: str
    time: str
    service: str
    hair_artist_id: int

class Booking(BaseModel):
    id: int
    name: str
    contact: str
    service: str
    datetime: datetime
    status: str
    created_at: datetime
    hair_artist_id: int

    class Config:
        from_attributes = True

class OTPVerification(BaseModel):
    contact: str
    code: str
    name: str
    service: str
    datetime: str
    hair_artist_id: int

class HairArtist(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_admin: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class HairArtistCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    is_admin: bool = False

class HairArtistLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    is_admin: Optional[bool] = None 