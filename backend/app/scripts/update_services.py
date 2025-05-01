from app.models.database import SessionLocal, Service
from datetime import datetime

def update_services():
    db = SessionLocal()
    
    try:
        # Update manicure and pedicure services to be female-only
        services_to_update = ["Manicure", "Pedicure"]
        
        for service_name in services_to_update:
            service = db.query(Service).filter(Service.name == service_name).first()
            if service:
                service.gender_specificity = "female"
                service.updated_at = datetime.now()
                print(f"Updated {service_name} to be female-only")
            else:
                print(f"Service {service_name} not found")
        
        db.commit()
        print("Successfully updated services")
    except Exception as e:
        print(f"Error updating services: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_services() 