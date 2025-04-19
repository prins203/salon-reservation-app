from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta, date, time
from ..models.database import get_db, Booking
from ..models.schemas import (
    BookingRequest,
    OTPRequest,
    Service,
    TimeSlot,
    BookingResponse,
    BookingCreate
)
from ..utils.otp import create_otp_record, verify_otp
from ..utils.email import send_otp_email
from ..routers.auth import get_current_hair_artist

router = APIRouter(prefix="/booking")

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
    try:
        # First verify the OTP
        print(f"Verifying OTP for contact: {otp_request.contact}, code: {otp_request.code}")
        if not verify_otp(db, otp_request.contact, otp_request.code):
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
        # Convert date string to Python date object
        booking_date = datetime.strptime(otp_request.date, "%Y-%m-%d").date()
        
        # Convert time string to Python time object
        booking_time = datetime.strptime(otp_request.time, "%H:%M").time()
        
        # Check if the slot is still available
        print(f"Checking slot availability for date: {booking_date}, time: {booking_time}, hair_artist_id: {otp_request.hair_artist_id}")
        existing_booking = db.query(Booking).filter(
            Booking.date == booking_date,
            Booking.time == booking_time,
            Booking.hair_artist_id == otp_request.hair_artist_id
        ).first()
        
        if existing_booking:
            raise HTTPException(status_code=400, detail="This time slot is no longer available")
        
        # Create the booking
        print(f"Creating booking for {otp_request.name}")
        booking = Booking(
            name=otp_request.name,
            email=otp_request.contact,
            phone="",
            service=otp_request.service,
            date=booking_date,
            time=booking_time,
            status="confirmed",
            hair_artist_id=otp_request.hair_artist_id
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
        
        return {"message": "OTP verified successfully", "booking_id": booking.id}
    except Exception as e:
        print(f"Error in verify-otp: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/services", response_model=List[Service])
async def get_services():
    return SERVICES

@router.get("/available-slots")
async def get_available_slots(date: str, hair_artist_id: int, db: Session = Depends(get_db)):
    """Get available time slots for a given date."""
    try:
        # Parse the input date
        booking_date = datetime.strptime(date, "%Y-%m-%d").date()
        current_time = datetime.now()
        
        # If the date is today, only show slots from current time onwards
        if booking_date == current_time.date():
            start_time = current_time.replace(second=0, microsecond=0)
            # Round up to the next 30-minute interval
            minutes_to_add = 30 - (start_time.minute % 30)
            start_time = start_time + timedelta(minutes=minutes_to_add)
        else:
            start_time = datetime.strptime("09:00", "%H:%M")
        
        end_time = datetime.strptime("18:00", "%H:%M")
        
        # Get all bookings for the date
        bookings = db.query(Booking).filter(
            Booking.date == booking_date,
            Booking.hair_artist_id == hair_artist_id,
            Booking.status == "confirmed"
        ).all()
        
        # Convert bookings to time slots
        booked_slots = {
            booking.time.strftime("%H:%M")
            for booking in bookings
        }
        
        # Generate all possible 30-minute slots for the day
        all_slots = set()
        current_slot = start_time
        
        while current_slot.time() < end_time.time():
            all_slots.add(current_slot.strftime("%H:%M"))
            current_slot = current_slot + timedelta(minutes=30)
        
        # Get available slots by subtracting booked slots
        available_slots = sorted(list(all_slots - booked_slots))
        
        return available_slots
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/bookings", response_model=List[BookingResponse])
async def get_bookings(
    date: str,
    db: Session = Depends(get_db),
    current_hair_artist = Depends(get_current_hair_artist)
):
    try:
        # Parse the date string to date
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
        
        # Get all bookings for the specified date
        bookings = db.query(Booking).filter(
            Booking.date == target_date,
            Booking.hair_artist_id == current_hair_artist.id
        ).all()
        
        # Convert datetime objects to strings in the response
        return [
            {
                **booking.__dict__,
                'date': booking.date.strftime("%Y-%m-%d"),
                'time': booking.time.strftime("%H:%M")
            }
            for booking in bookings
        ]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

@router.post("/bookings", response_model=BookingResponse)
async def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    try:
        # Parse the booking date and time strings into Python objects
        booking_date = datetime.strptime(booking.date, "%Y-%m-%d").date()
        booking_time = datetime.strptime(booking.time, "%H:%M").time()
        
        # Check if the booking is in the past
        current_time = datetime.now()
        booking_datetime = datetime.combine(booking_date, booking_time)
        if booking_datetime < current_time:
            raise HTTPException(
                status_code=400,
                detail="Cannot book appointments in the past"
            )
        
        # Check if the slot is available
        existing_booking = db.query(Booking).filter(
            Booking.date == booking_date,
            Booking.time == booking_time,
            Booking.hair_artist_id == booking.hair_artist_id,
            Booking.status == "confirmed"
        ).first()
        
        if existing_booking:
            raise HTTPException(
                status_code=400,
                detail="This time slot is already booked"
            )
        
        # Create new booking with proper date and time objects
        db_booking = Booking(
            name=booking.name,
            email=booking.email,
            phone=booking.phone,
            date=booking_date,
            time=booking_time,
            service=booking.service,
            hair_artist_id=booking.hair_artist_id,
            status="pending"
        )
        
        db.add(db_booking)
        db.commit()
        db.refresh(db_booking)
        
        # Convert the response to include string values for date and time
        return {
            **db_booking.__dict__,
            'date': db_booking.date.strftime("%Y-%m-%d"),
            'time': db_booking.time.strftime("%H:%M")
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e)) 