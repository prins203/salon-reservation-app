from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
from passlib.context import CryptContext

from ..models.database import get_db, HairArtist
from ..models.schemas import Token, TokenData, HairArtistCreate, HairArtist as HairArtistSchema

router = APIRouter()

# JWT Configuration
SECRET_KEY = "your-secret-key"  # In production, use a secure secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_hair_artist(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    hair_artist = db.query(HairArtist).filter(HairArtist.email == token_data.email).first()
    if hair_artist is None:
        raise credentials_exception
    return hair_artist

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    hair_artist = db.query(HairArtist).filter(HairArtist.email == form_data.username).first()
    if not hair_artist or not hair_artist.verify_password(form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": hair_artist.email, "is_admin": hair_artist.is_admin},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/hair-artists/", response_model=HairArtistSchema)
def create_hair_artist(hair_artist: HairArtistCreate, db: Session = Depends(get_db)):
    db_hair_artist = db.query(HairArtist).filter(HairArtist.email == hair_artist.email).first()
    if db_hair_artist:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(hair_artist.password)
    db_hair_artist = HairArtist(
        name=hair_artist.name,
        email=hair_artist.email,
        hashed_password=hashed_password,
        is_admin=hair_artist.is_admin
    )
    db.add(db_hair_artist)
    db.commit()
    db.refresh(db_hair_artist)
    return db_hair_artist

@router.get("/hair-artists/me", response_model=HairArtistSchema)
async def read_hair_artists_me(current_hair_artist: HairArtist = Depends(get_current_hair_artist)):
    return current_hair_artist 