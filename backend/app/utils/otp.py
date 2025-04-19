import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.database import OTP

def generate_otp() -> str:
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])

def create_otp_record(db: Session, contact: str) -> OTP:
    code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
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
    otp_record = db.query(OTP).filter(
        OTP.contact == contact,
        OTP.code == code,
        OTP.expires_at > datetime.utcnow(),
        OTP.verified == False
    ).first()
    
    if otp_record:
        otp_record.verified = True
        db.commit()
        return True
    
    return False 