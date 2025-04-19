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

router = APIRouter()

# Hardcoded services for demo
SERVICES = [
    Service(id=1, name="Haircut", duration=30, price=25.00),
    Service(id=2, name="Hair Coloring", duration=120, price=80.00),
    Service(id=3, name="Manicure", duration=45, price=35.00),
    Service(id=4, name="Pedicure", duration=60, price=45.00),
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
    if not verify_otp(db, otp_request.contact, otp_request.code):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Check if the slot is still available
    existing_booking = db.query(Booking).filter(
        Booking.datetime == otp_request.datetime
    ).first()
    
    if existing_booking:
        raise HTTPException(status_code=400, detail="This time slot is no longer available")
    
    # Create the booking
    booking = Booking(
        name=otp_request.name,
        contact=otp_request.contact,
        service=otp_request.service,
        datetime=otp_request.datetime,
        status="confirmed"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    return {"message": "OTP verified successfully", "booking_id": booking.id}

@router.get("/services", response_model=List[Service])
async def get_services():
    return SERVICES

@router.get("/available-slots")
async def get_available_slots(date: str, db: Session = Depends(get_db)):
    # Generate time slots for the selected date
    base_date = datetime.strptime(date, "%Y-%m-%d")
    slots = []
    
    # Get existing bookings for this date
    existing_bookings = db.query(Booking).filter(
        Booking.datetime >= base_date,
        Booking.datetime < base_date + timedelta(days=1)
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