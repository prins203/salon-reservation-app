import sys
import os
from datetime import datetime
from sqlalchemy.orm import Session
from passlib.context import CryptContext

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.models.database import SessionLocal, Service, HairArtist
from app.scripts.seed_services import seed_services
from app.scripts.seed_hair_artists import seed_hair_artists

def seed_database():
    """Seed the database with initial data"""
    print("Starting database seeding...")
    
    try:
        # Seed services
        print("\nSeeding services...")
        seed_services()
        
        # Seed hair artists
        print("\nSeeding hair artists...")
        seed_hair_artists()
        
        print("\nDatabase seeding completed successfully!")
    except Exception as e:
        print(f"\nError during database seeding: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    seed_database() 