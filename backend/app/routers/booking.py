from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta, date, time
from ..models.database import get_db, Booking, Service, HairArtist
from ..models.schemas import (
    BookingRequest,
    OTPRequest,
    Service as ServiceSchema,
    TimeSlot,
    BookingResponse,
    BookingCreate
)
from ..utils.otp import create_otp_record, verify_otp
from ..utils.email import send_otp_email
from ..routers.auth import get_current_hair_artist

router = APIRouter(prefix="/booking")

@router.get("/services", response_model=List[ServiceSchema])
async def get_services(db: Session = Depends(get_db)):
    services = db.query(Service).all()
    return services

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
        
        # Validate that all required fields are present and not empty
        required_fields = {
            'date': otp_request.date,
            'time': otp_request.time,
            'name': otp_request.name,
            'service': otp_request.service,
            'hair_artist_id': otp_request.hair_artist_id
        }
        
        missing_fields = [field for field, value in required_fields.items() 
                         if not value and field not in ['hair_artist_id'] or 
                         (field == 'hair_artist_id' and not str(value))]
        
        if missing_fields:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields: {', '.join(missing_fields)}"
            )
            
        # Safety checks for date and time format
        try:
            # Convert date string to Python date object
            booking_date = datetime.strptime(otp_request.date, "%Y-%m-%d").date()
            
            # Convert time string to Python time object
            booking_time = datetime.strptime(otp_request.time, "%H:%M").time()
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid date or time format: {str(e)}. Use YYYY-MM-DD for date and HH:MM for time."
            )
        
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
            hair_artist_id=otp_request.hair_artist_id,
            gender=otp_request.gender
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
        
        return {"message": "OTP verified successfully", "booking_id": booking.id}
    except HTTPException as http_exc:
        # Re-raise HTTP exceptions directly
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        # Log error and return a generic message
        print(f"Error verifying OTP: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to verify OTP")

@router.get("/available-slots")
async def get_available_slots(
    date: str, 
    hair_artist_id: int, 
    service_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get available time slots for a given date, considering service duration and slot gap"""
    try:
        # Add detailed logging for better diagnostics, similar to our authentication fixes
        print(f"Generating available slots for date: {date}, hair_artist: {hair_artist_id}, service: {service_id}")
        
        # Parse the input date
        booking_date = datetime.strptime(date, "%Y-%m-%d").date()
        current_time = datetime.now()
        
        # Check if the date is a Tuesday (salon closed)
        if booking_date.weekday() == 1:  # 1 is Tuesday
            print("Tuesday is a day off - no slots available")
            return []
        
        # Get service information if provided
        service_duration = 30  # Default duration in minutes
        slot_gap_minutes = 30  # Default slot gap
        
        if service_id:
            service = db.query(Service).filter(Service.id == service_id).first()
            if service:
                service_duration = service.duration
                slot_gap_minutes = service.slot_gap_minutes
                print(f"Using service: {service.name}, duration: {service_duration}min, slot gap: {slot_gap_minutes}min")
            else:
                print(f"Warning: Service ID {service_id} not found, using defaults")
        
        # Define salon hours (9 AM to 5 PM)
        salon_open = datetime.combine(booking_date, time(9, 0))
        salon_close = datetime.combine(booking_date, time(17, 0))
        
        # For current day bookings, use the current time as the starting point
        if booking_date == current_time.date() and current_time.time() > salon_open.time():
            # Use current time as the starting point - this is the key change to show the earliest available slot
            current_slot = current_time
            print(f"Booking for today, starting from current time: {current_slot.strftime('%H:%M')}")
        else:
            current_slot = salon_open
            print(f"Booking for future date, starting from opening time: {salon_open.strftime('%H:%M')}")
        
        # Get all bookings for the given date and hair artist
        bookings = db.query(Booking).filter(
            Booking.date == booking_date,
            Booking.hair_artist_id == hair_artist_id,
            Booking.status != "cancelled"
        ).all()
        print(f"Found {len(bookings)} existing bookings for this day and artist")
        
        all_slots = []
        
        # Generate time slots
        while current_slot < salon_close:
            # End time of the current appointment slot
            end_time = current_slot + timedelta(minutes=service_duration)
            
            # Check if the end time is after the salon closes
            if end_time > salon_close:
                print(f"Stopping slot generation at {current_slot.strftime('%H:%M')} as it would end after closing")
                break
            
            is_available = True
            
            # Check if the current slot overlaps with any existing bookings
            for booking in bookings:
                booking_start = datetime.combine(booking_date, booking.time)
                service_name = booking.service
                
                # Find service duration for this booking
                booking_service = db.query(Service).filter(Service.name == service_name).first()
                booking_duration = 30  # Default duration if service not found
                if booking_service:
                    booking_duration = booking_service.duration
                
                booking_end = booking_start + timedelta(minutes=booking_duration)
                
                # Check for overlap
                if (current_slot < booking_end and end_time > booking_start):
                    print(f"Slot {current_slot.strftime('%H:%M')} conflicts with booking {booking.id} at {booking_start.strftime('%H:%M')}")
                    is_available = False
                    break
            
            if is_available:
                time_str = current_slot.strftime("%H:%M")
                print(f"Adding available slot: {time_str}")
                all_slots.append(time_str)
            
            # Key change: Move to next slot using the service's slot gap setting
            # This makes the slot gaps configurable
            if booking_date == current_time.date() and len(all_slots) == 0:
                # For first slot of current day, increment by just 15 minutes to find earliest slot
                # This helps find the exact earliest available slot rather than only 30-min boundaries
                increment = min(15, slot_gap_minutes)
                print(f"Looking for earliest slot, incrementing by {increment} minutes")
            else:
                # For subsequent slots or future dates, use the configured slot gap
                increment = slot_gap_minutes
            
            current_slot = current_slot + timedelta(minutes=increment)
        
        slots = sorted(all_slots)
        print(f"Generated {len(slots)} available slots")
        return slots
    except Exception as e:
        print(f"Error generating available slots: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/bookings", response_model=List[BookingResponse])
async def get_bookings(
    date: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_hair_artist = Depends(get_current_hair_artist)
):
    try:
        if start_date and end_date:
            # Parse the date range
            start = datetime.strptime(start_date, "%Y-%m-%d").date()
            end = datetime.strptime(end_date, "%Y-%m-%d").date()
            
            # Get all bookings for the specified date range
            bookings = db.query(Booking).filter(
                Booking.date >= start,
                Booking.date <= end,
                Booking.hair_artist_id == current_hair_artist.id
            ).all()
        else:
            # Parse the single date string to date (backward compatibility)
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
    except ValueError as e:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid date format: {str(e)}. Use YYYY-MM-DD format."
        )

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
            gender=booking.gender,
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
