from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import booking

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

@app.get("/")
async def root():
    return {"message": "Welcome to Salon Booking API"} 