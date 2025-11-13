from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.models.watch_party import (
    WatchParty, WatchPartyTimeSlot, WatchPartyParticipant, WatchPartyVote
)
from app.schemas.watch_party import (
    WatchPartyCreate, WatchPartyUpdate, ParticipantCreate, VoteCreate
)


def create_watch_party(db: Session, party_data: WatchPartyCreate) -> WatchParty:
    """Create a new watch party with time slots and participants."""
    
    # Create the watch party
    db_party = WatchParty(
        movie_id=party_data.movie_id,
        title=party_data.title,
        host_name=party_data.host_name,
        notes=party_data.notes
    )
    db.add(db_party)
    db.flush()
    
    # Create time slots
    for time_slot_dt in party_data.time_slots:
        db_time_slot = WatchPartyTimeSlot(
            watch_party_id=db_party.id,
            proposed_datetime=time_slot_dt
        )
        db.add(db_time_slot)
    
    # Create participants
    for participant_data in party_data.participants:
        db_participant = WatchPartyParticipant(
            watch_party_id=db_party.id,
            name=participant_data.name,
            email=participant_data.email
        )
        db.add(db_participant)
    
    db.commit()
    db.refresh(db_party)
    return db_party


def get_watch_party(db: Session, party_id: int) -> WatchParty:
    """Get a watch party by ID."""
    return db.query(WatchParty).filter(WatchParty.id == party_id).first()


def get_watch_parties_by_movie(db: Session, movie_id: int) -> List[WatchParty]:
    """Get all watch parties for a specific movie."""
    return db.query(WatchParty).filter(WatchParty.movie_id == movie_id).order_by(WatchParty.created_at.desc()).all()


def get_all_watch_parties(db: Session, skip: int = 0, limit: int = 100) -> List[WatchParty]:
    """Get all watch parties."""
    return db.query(WatchParty).order_by(WatchParty.created_at.desc()).offset(skip).limit(limit).all()


def update_watch_party(db: Session, party_id: int, party_update: WatchPartyUpdate) -> WatchParty:
    """Update a watch party."""
    db_party = get_watch_party(db, party_id)
    if not db_party:
        return None
    
    update_data = party_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_party, field, value)
    
    db.commit()
    db.refresh(db_party)
    return db_party


def delete_watch_party(db: Session, party_id: int) -> bool:
    """Delete a watch party."""
    db_party = get_watch_party(db, party_id)
    if not db_party:
        return False
    
    db.delete(db_party)
    db.commit()
    return True


def add_participant(db: Session, party_id: int, participant_data: ParticipantCreate) -> WatchPartyParticipant:
    """Add a participant to a watch party."""
    db_participant = WatchPartyParticipant(
        watch_party_id=party_id,
        name=participant_data.name,
        email=participant_data.email
    )
    db.add(db_participant)
    db.commit()
    db.refresh(db_participant)
    return db_participant


def cast_vote(db: Session, vote_data: VoteCreate) -> WatchPartyVote:
    """Cast or update a vote for a time slot."""
    
    # Check if participant already voted for this time slot
    existing_vote = db.query(WatchPartyVote).filter(
        WatchPartyVote.participant_id == vote_data.participant_id,
        WatchPartyVote.time_slot_id == vote_data.time_slot_id
    ).first()
    
    if existing_vote:
        # Update existing vote
        existing_vote.is_available = vote_data.is_available
        db.commit()
        db.refresh(existing_vote)
        vote = existing_vote
    else:
        # Create new vote
        db_vote = WatchPartyVote(
            participant_id=vote_data.participant_id,
            time_slot_id=vote_data.time_slot_id,
            is_available=vote_data.is_available
        )
        db.add(db_vote)
        db.commit()
        db.refresh(db_vote)
        vote = db_vote
    
    # Update vote count for the time slot
    update_time_slot_votes(db, vote_data.time_slot_id)
    
    return vote


def update_time_slot_votes(db: Session, time_slot_id: int):
    """Update the vote count for a time slot."""
    time_slot = db.query(WatchPartyTimeSlot).filter(WatchPartyTimeSlot.id == time_slot_id).first()
    if time_slot:
        # Count votes where is_available = True
        vote_count = db.query(WatchPartyVote).filter(
            WatchPartyVote.time_slot_id == time_slot_id,
            WatchPartyVote.is_available == True
        ).count()
        time_slot.votes = vote_count
        db.commit()


def get_best_time(db: Session, party_id: int):
    """Get the best time slot based on votes."""
    party = get_watch_party(db, party_id)
    if not party or not party.time_slots:
        return None
    
    total_participants = len(party.participants)
    if total_participants == 0:
        return None
    
    best_slot = None
    best_score = -1
    
    for time_slot in party.time_slots:
        # Count available votes
        available_count = db.query(WatchPartyVote).filter(
            WatchPartyVote.time_slot_id == time_slot.id,
            WatchPartyVote.is_available == True
        ).count()
        
        availability_percentage = (available_count / total_participants) * 100
        
        if available_count > best_score:
            best_score = available_count
            best_slot = {
                "time_slot_id": time_slot.id,
                "proposed_datetime": time_slot.proposed_datetime,
                "votes": time_slot.votes,
                "available_count": available_count,
                "total_participants": total_participants,
                "availability_percentage": round(availability_percentage, 1)
            }
    
    return best_slot
