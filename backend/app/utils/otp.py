import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.database import OTP

def generate_otp() -> str:
    otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    return otp

def create_otp_record(db: Session, contact: str) -> OTP:
    code = generate_otp()
    expires_at = datetime.now(datetime.timezone.utc) + timedelta(minutes=10)
    
    otp_record = OTP(
        contact=contact,
        code=code,
        expires_at=expires_at
    )
    
    db.add(otp_record)
    db.commit()
    db.refresh(otp_record)
    
    return otp_record

def verify_otp(db: Session, contact: str, code: str) -> bool:

    # Check if there's any OTP record for this contact
    contact_records_count = db.query(OTP).filter(OTP.contact == contact).count()

    # Check if there are any non-expired records
    non_expired_count = db.query(OTP).filter(
        OTP.contact == contact,
        OTP.expires_at > datetime.now(datetime.timezone.utc)
    ).count()

    # Find the specific OTP record
    otp_record = db.query(OTP).filter(
        OTP.contact == contact,
        OTP.code == code,
        OTP.expires_at > datetime.now(datetime.timezone.utc),
        OTP.verified == False
    ).order_by(OTP.created_at.desc()).first()
    
    if otp_record:
        otp_record.verified = True
        db.commit()
        return True
    else:
        return False