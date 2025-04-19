from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from ..models.database import get_db, Booking
from ..models.schemas import (
    BookingRequest,
    OTPRequest,
    Service,
    TimeSlot,
    BookingResponse
)
from ..utils.otp import create_otp_record, verify_otp
from ..utils.email import send_otp_email
from ..routers.auth import get_current_hair_artist

router = APIRouter()

# Hardcoded services for demo
SERVICES = [
    Service(
        id=1,
        name="Haircut",
        description="Basic haircut service",
        duration=30,
        price=25.00,
        created_at=datetime.now(),
        updated_at=datetime.now()
    ),
    Service(
        id=2,
        name="Hair Coloring",
        description="Full hair coloring service",
        duration=120,
        price=80.00,
        created_at=datetime.now(),
        updated_at=datetime.now()
    ),
    Service(
        id=3,
        name="Manicure",
        description="Basic manicure service",
        duration=45,
        price=35.00,
        created_at=datetime.now(),
        updated_at=datetime.now()
    ),
    Service(
        id=4,
        name="Pedicure",
        description="Basic pedicure service",
        duration=60,
        price=45.00,
        created_at=datetime.now(),
        updated_at=datetime.now()
    ),
]

@router.post("/send-otp")
async def send_otp(booking: BookingRequest, db: Session = Depends(get_db)):
    # Create OTP record
    otp_record = create_otp_record(db, booking.contact)
    
    # Skip email verification for testing
    print(f"OTP for {booking.contact}: {otp_record.code}")
    
    return {"message": "OTP sent successfully", "otp_id": otp_record.id}

@router.post("/verify-otp")
async def verify_otp_endpoint(otp_request: OTPRequest, db: Session = Depends(get_db)):
    # First verify the OTP
    if not verify_otp(db, otp_request.contact, otp_request.code):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Check if the slot is still available
    existing_booking = db.query(Booking).filter(
        Booking.datetime == otp_request.datetime,
        Booking.hair_artist_id == otp_request.hair_artist_id
    ).first()
    
    if existing_booking:
        raise HTTPException(status_code=400, detail="This time slot is no longer available")
    
    try:
        # Create the booking
        booking = Booking(
            name=otp_request.name,
            contact=otp_request.contact,
            service=otp_request.service,
            datetime=otp_request.datetime,
            status="confirmed",
            hair_artist_id=otp_request.hair_artist_id
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
        
        return {"message": "OTP verified successfully", "booking_id": booking.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create booking")

@router.get("/services", response_model=List[Service])
async def get_services():
    return SERVICES

@router.get("/available-slots")
async def get_available_slots(date: str, hair_artist_id: int, db: Session = Depends(get_db)):
    # Generate time slots for the selected date
    base_date = datetime.strptime(date, "%Y-%m-%d")
    slots = []
    
    # Get existing bookings for this date and hair artist
    existing_bookings = db.query(Booking).filter(
        Booking.datetime >= base_date,
        Booking.datetime < base_date + timedelta(days=1),
        Booking.hair_artist_id == hair_artist_id
    ).all()
    
    # Convert existing bookings to a set of times for quick lookup
    booked_times = {booking.datetime.time() for booking in existing_bookings}
    
    for hour in range(9, 17):  # 9 AM to 5 PM
        start_time = base_date.replace(hour=hour, minute=0)
        end_time = start_time + timedelta(hours=1)
        
        # Check if this slot is already booked
        is_available = start_time.time() not in booked_times
        
        slots.append(TimeSlot(
            start_time=start_time,
            end_time=end_time,
            available=is_available
        ))
    
    return slots

@router.get("/bookings", response_model=List[BookingResponse])
async def get_bookings(
    date: str,
    db: Session = Depends(get_db),
    current_hair_artist = Depends(get_current_hair_artist)
):
    try:
        # Parse the date string to datetime
        target_date = datetime.strptime(date, "%Y-%m-%d")
        
        # Get all bookings for the specified date
        bookings = db.query(Booking).filter(
            Booking.datetime >= target_date,
            Booking.datetime < target_date + timedelta(days=1),
            Booking.hair_artist_id == current_hair_artist.id
        ).all()
        
        return bookings
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD") 