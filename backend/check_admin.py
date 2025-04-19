from app.models.database import SessionLocal, HairArtist
from app.routers.auth import get_password_hash

def check_admin():
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(HairArtist).filter(HairArtist.email == "prins.patel000@gmail.com").first()
        if not admin:
            # Create admin user
            admin = HairArtist(
                name="Vikas",
                email="prins.patel000@gmail.com",
                hashed_password=get_password_hash("aone1234"),
                is_admin=True
            )
            db.add(admin)
            db.commit()
            print("Admin user created successfully!")
        else:
            print("Admin user already exists!")
    finally:
        db.close()

if __name__ == "__main__":
    check_admin() 