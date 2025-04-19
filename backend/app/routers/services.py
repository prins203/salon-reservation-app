from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..models.database import get_db, Service, HairArtist
from ..models.schemas import Service as ServiceSchema, ServiceCreate
from ..routers.auth import get_current_hair_artist

router = APIRouter()

def get_admin_hair_artist(current_hair_artist: HairArtist = Depends(get_current_hair_artist)):
    if not current_hair_artist.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_hair_artist

@router.get("/services/", response_model=List[ServiceSchema])
def list_services(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    services = db.query(Service).offset(skip).limit(limit).all()
    return services

@router.post("/services/", response_model=ServiceSchema)
def create_service(
    service: ServiceCreate,
    db: Session = Depends(get_db),
    current_hair_artist: HairArtist = Depends(get_admin_hair_artist)
):
    db_service = Service(**service.dict())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

@router.put("/services/{service_id}", response_model=ServiceSchema)
def update_service(
    service_id: int,
    service: ServiceCreate,
    db: Session = Depends(get_db),
    current_hair_artist: HairArtist = Depends(get_admin_hair_artist)
):
    db_service = db.query(Service).filter(Service.id == service_id).first()
    if not db_service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    for key, value in service.dict().items():
        setattr(db_service, key, value)
    
    db.commit()
    db.refresh(db_service)
    return db_service

@router.delete("/services/{service_id}")
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_hair_artist: HairArtist = Depends(get_admin_hair_artist)
):
    db_service = db.query(Service).filter(Service.id == service_id).first()
    if not db_service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    db.delete(db_service)
    db.commit()
    return {"message": "Service deleted successfully"} 