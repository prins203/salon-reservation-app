from app.models.database import SessionLocal, HairArtist
from datetime import datetime
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_hair_artists():
    db = SessionLocal()
    
    # Default hair artists
    hair_artists = [
        {
            "name": "Admin",
            "email": "admin@salon.com",
            "hashed_password": pwd_context.hash("admin123"),
            "is_admin": True,
            "created_at": datetime.now()
        },
        {
            "name": "John Doe",
            "email": "john@salon.com",
            "hashed_password": pwd_context.hash("password123"),
            "is_admin": False,
            "created_at": datetime.now()
        },
        {
            "name": "Jane Smith",
            "email": "jane@salon.com",
            "hashed_password": pwd_context.hash("password123"),
            "is_admin": False,
            "created_at": datetime.now()
        }
    ]
    
    try:
        # Check if hair artists already exist
        existing_artists = db.query(HairArtist).all()
        if existing_artists:
            print("Hair artists already exist in the database")
            return
        
        # Add hair artists
        for artist_data in hair_artists:
            artist = HairArtist(**artist_data)
            db.add(artist)
        
        db.commit()
        print("Successfully added default hair artists")
    except Exception as e:
        print(f"Error adding hair artists: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_hair_artists() 