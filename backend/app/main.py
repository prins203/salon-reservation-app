from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .routers import booking, services, hair_artists, auth
from .models.database import get_db
from datetime import datetime
from .db.seed import seed_services

app = FastAPI(title="Salon Booking API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app will run on port 3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(booking.router, prefix="/api", tags=["booking"])
app.include_router(services.router, prefix="/api", tags=["services"])
app.include_router(hair_artists.router, prefix="/api", tags=["hair_artists"])
app.include_router(auth.router, prefix="/api", tags=["auth"])

# Seed the database with initial data
@app.on_event("startup")
async def startup_event():
    db = next(get_db())
    seed_services(db)
    db.close()

@app.get("/")
async def root():
    return {"message": "Welcome to Salon Booking API"}

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        # Test database connection
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        } 