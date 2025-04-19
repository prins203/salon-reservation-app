from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..models.database import get_db, HairArtist
from ..models.schemas import HairArtist as HairArtistSchema
from ..routers.auth import get_current_hair_artist

router = APIRouter()

def get_admin_hair_artist(current_hair_artist: HairArtist = Depends(get_current_hair_artist)):
    if not current_hair_artist.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_hair_artist

@router.get("/hair-artists/public", response_model=List[HairArtistSchema])
def list_hair_artists_public(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    hair_artists = db.query(HairArtist).offset(skip).limit(limit).all()
    return hair_artists

@router.get("/hair-artists/", response_model=List[HairArtistSchema])
def list_hair_artists(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_hair_artist: HairArtist = Depends(get_admin_hair_artist)
):
    hair_artists = db.query(HairArtist).offset(skip).limit(limit).all()
    return hair_artists

@router.delete("/hair-artists/{hair_artist_id}")
def delete_hair_artist(
    hair_artist_id: int,
    db: Session = Depends(get_db),
    current_hair_artist: HairArtist = Depends(get_admin_hair_artist)
):
    if current_hair_artist.id == hair_artist_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    hair_artist = db.query(HairArtist).filter(HairArtist.id == hair_artist_id).first()
    if not hair_artist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hair artist not found"
        )
    
    db.delete(hair_artist)
    db.commit()
    return {"message": "Hair artist deleted successfully"} 