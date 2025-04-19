from app.models.database import SessionLocal, Service
from datetime import datetime

def seed_services():
    db = SessionLocal()
    
    # Default services
    services = [
        {
            "name": "Haircut",
            "description": "Basic haircut service",
            "price": 25.00,
            "duration": 30,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Hair Coloring",
            "description": "Full hair coloring service",
            "price": 80.00,
            "duration": 120,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Manicure",
            "description": "Basic manicure service",
            "price": 35.00,
            "duration": 45,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Pedicure",
            "description": "Basic pedicure service",
            "price": 45.00,
            "duration": 60,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]
    
    try:
        # Check if services already exist
        existing_services = db.query(Service).all()
        if existing_services:
            print("Services already exist in the database")
            return
        
        # Add services
        for service_data in services:
            service = Service(**service_data)
            db.add(service)
        
        db.commit()
        print("Successfully added default services")
    except Exception as e:
        print(f"Error adding services: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_services() 