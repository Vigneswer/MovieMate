from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class WatchParty(Base):
    """Watch Party model for planning group viewing sessions."""
    
    __tablename__ = "watch_parties"
    
    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)  # Party title/description
    host_name = Column(String(100), nullable=False)
    
    # Selected time (once decided)
    selected_datetime = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Status
    is_finalized = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    time_slots = relationship("WatchPartyTimeSlot", back_populates="watch_party", cascade="all, delete-orphan")
    participants = relationship("WatchPartyParticipant", back_populates="watch_party", cascade="all, delete-orphan")


class WatchPartyTimeSlot(Base):
    """Proposed time slots for a watch party."""
    
    __tablename__ = "watch_party_time_slots"
    
    id = Column(Integer, primary_key=True, index=True)
    watch_party_id = Column(Integer, ForeignKey("watch_parties.id", ondelete="CASCADE"), nullable=False)
    
    # Time slot
    proposed_datetime = Column(DateTime(timezone=True), nullable=False)
    
    # Votes count
    votes = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    watch_party = relationship("WatchParty", back_populates="time_slots")
    voters = relationship("WatchPartyVote", back_populates="time_slot", cascade="all, delete-orphan")


class WatchPartyParticipant(Base):
    """Participants in a watch party."""
    
    __tablename__ = "watch_party_participants"
    
    id = Column(Integer, primary_key=True, index=True)
    watch_party_id = Column(Integer, ForeignKey("watch_parties.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    
    # Timestamps
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    watch_party = relationship("WatchParty", back_populates="participants")
    votes = relationship("WatchPartyVote", back_populates="participant", cascade="all, delete-orphan")


class WatchPartyVote(Base):
    """Votes for time slots."""
    
    __tablename__ = "watch_party_votes"
    
    id = Column(Integer, primary_key=True, index=True)
    time_slot_id = Column(Integer, ForeignKey("watch_party_time_slots.id", ondelete="CASCADE"), nullable=False)
    participant_id = Column(Integer, ForeignKey("watch_party_participants.id", ondelete="CASCADE"), nullable=False)
    
    # Vote status
    is_available = Column(Boolean, default=True)  # True = available, False = not available
    
    # Timestamps
    voted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    time_slot = relationship("WatchPartyTimeSlot", back_populates="voters")
    participant = relationship("WatchPartyParticipant", back_populates="votes")
