from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.watch_party import (
    WatchParty as WatchPartySchema,
    WatchPartyCreate,
    WatchPartyUpdate,
    ParticipantCreate,
    Participant,
    VoteCreate,
    BestTimeRecommendation
)
from app.crud import watch_party as watch_party_crud

router = APIRouter(prefix="/watch-parties", tags=["Watch Parties"])


@router.post("/", response_model=WatchPartySchema, status_code=status.HTTP_201_CREATED, summary="Create watch party")
def create_watch_party(
    party_data: WatchPartyCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new watch party for a movie/TV show.
    Includes initial time slots and participants.
    """
    return watch_party_crud.create_watch_party(db, party_data)


@router.get("/", response_model=List[WatchPartySchema], summary="Get all watch parties")
def get_all_watch_parties(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all watch parties."""
    return watch_party_crud.get_all_watch_parties(db, skip, limit)


@router.get("/{party_id}", response_model=WatchPartySchema, summary="Get watch party by ID")
def get_watch_party(
    party_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific watch party by ID."""
    party = watch_party_crud.get_watch_party(db, party_id)
    if not party:
        raise HTTPException(status_code=404, detail="Watch party not found")
    return party


@router.get("/movie/{movie_id}", response_model=List[WatchPartySchema], summary="Get watch parties for a movie")
def get_watch_parties_by_movie(
    movie_id: int,
    db: Session = Depends(get_db)
):
    """Get all watch parties for a specific movie."""
    return watch_party_crud.get_watch_parties_by_movie(db, movie_id)


@router.put("/{party_id}", response_model=WatchPartySchema, summary="Update watch party")
def update_watch_party(
    party_id: int,
    party_update: WatchPartyUpdate,
    db: Session = Depends(get_db)
):
    """Update a watch party."""
    party = watch_party_crud.update_watch_party(db, party_id, party_update)
    if not party:
        raise HTTPException(status_code=404, detail="Watch party not found")
    return party


@router.delete("/{party_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete watch party")
def delete_watch_party(
    party_id: int,
    db: Session = Depends(get_db)
):
    """Delete a watch party."""
    success = watch_party_crud.delete_watch_party(db, party_id)
    if not success:
        raise HTTPException(status_code=404, detail="Watch party not found")


@router.post("/{party_id}/participants", response_model=Participant, summary="Add participant")
def add_participant(
    party_id: int,
    participant_data: ParticipantCreate,
    db: Session = Depends(get_db)
):
    """Add a participant to a watch party."""
    # Check if party exists
    party = watch_party_crud.get_watch_party(db, party_id)
    if not party:
        raise HTTPException(status_code=404, detail="Watch party not found")
    
    return watch_party_crud.add_participant(db, party_id, participant_data)


@router.post("/{party_id}/votes", summary="Cast vote")
def cast_vote(
    party_id: int,
    vote_data: VoteCreate,
    db: Session = Depends(get_db)
):
    """Cast or update a vote for a time slot."""
    # Check if party exists
    party = watch_party_crud.get_watch_party(db, party_id)
    if not party:
        raise HTTPException(status_code=404, detail="Watch party not found")
    
    vote = watch_party_crud.cast_vote(db, vote_data)
    return {"message": "Vote recorded successfully", "vote_id": vote.id}


@router.get("/{party_id}/best-time", response_model=BestTimeRecommendation, summary="Get best time")
def get_best_time(
    party_id: int,
    db: Session = Depends(get_db)
):
    """Get the best time slot based on participant availability."""
    best_time = watch_party_crud.get_best_time(db, party_id)
    if not best_time:
        raise HTTPException(status_code=404, detail="No suitable time found or watch party not found")
    return best_time
