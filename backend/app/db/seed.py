from sqlalchemy.orm import Session
from app.models.database import Service
from datetime import datetime

def seed_services(db: Session):
    services = [
        {
            "name": "Haircut",
            "description": "Basic haircut service",
            "duration": 30,
            "price": 25.00,
            "gender_specificity": "both"
        },
        {
            "name": "Hair Coloring",
            "description": "Full hair coloring service",
            "duration": 120,
            "price": 80.00,
            "gender_specificity": "both"
        },
        {
            "name": "Shaving",
            "description": "Professional shaving service",
            "duration": 30,
            "price": 20.00,
            "gender_specificity": "male"
        },
        {
            "name": "Beard Trim",
            "description": "Beard trimming and styling",
            "duration": 20,
            "price": 15.00,
            "gender_specificity": "male"
        },
        {
            "name": "Waxing",
            "description": "Full body waxing service",
            "duration": 60,
            "price": 50.00,
            "gender_specificity": "female"
        },
        {
            "name": "Eyebrows",
            "description": "Eyebrow shaping and threading",
            "duration": 30,
            "price": 25.00,
            "gender_specificity": "female"
        },
        {
            "name": "Facial",
            "description": "Basic facial treatment",
            "duration": 45,
            "price": 40.00,
            "gender_specificity": "both"
        }
    ]
    
    for service_data in services:
        # Check if service exists
        existing_service = db.query(Service).filter(Service.name == service_data["name"]).first()
        
        if existing_service:
            # Update existing service
            existing_service.description = service_data["description"]
            existing_service.duration = service_data["duration"]
            existing_service.price = service_data["price"]
            existing_service.gender_specificity = service_data["gender_specificity"]
            existing_service.updated_at = datetime.now()
        else:
            # Create new service
            service = Service(
                name=service_data["name"],
                description=service_data["description"],
                duration=service_data["duration"],
                price=service_data["price"],
                gender_specificity=service_data["gender_specificity"],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            db.add(service)
    
    db.commit() 