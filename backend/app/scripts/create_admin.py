from sqlalchemy.orm import Session
from app.models.database import get_db, HairArtist
from app.routers.auth import get_password_hash

def create_admin():
    db = next(get_db())
    try:
        # Check if admin already exists
        admin = db.query(HairArtist).filter(HairArtist.email == "prins.patel000@gmail.com").first()
        if admin:
            print("Admin already exists")
            return

        # Create new admin
        admin = HairArtist(
            name="Vikas",
            email="prins.patel000@gmail.com",
            hashed_password=get_password_hash("aone1234"),
            is_admin=True
        )
        db.add(admin)
        db.commit()
        print("Admin created successfully")
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin() 