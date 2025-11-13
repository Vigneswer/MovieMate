from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime


class ParticipantBase(BaseModel):
    """Base schema for watch party participant."""
    name: str = Field(..., min_length=1, max_length=100)
    email: Optional[EmailStr] = None


class ParticipantCreate(ParticipantBase):
    """Schema for creating a participant."""
    pass


class Participant(ParticipantBase):
    """Schema for participant response."""
    id: int
    joined_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TimeSlotBase(BaseModel):
    """Base schema for time slot."""
    proposed_datetime: datetime


class TimeSlotCreate(TimeSlotBase):
    """Schema for creating a time slot."""
    pass


class TimeSlot(TimeSlotBase):
    """Schema for time slot response."""
    id: int
    votes: int = 0
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class VoteCreate(BaseModel):
    """Schema for creating a vote."""
    participant_id: int
    time_slot_id: int
    is_available: bool = True


class WatchPartyBase(BaseModel):
    """Base schema for watch party."""
    movie_id: int
    title: str = Field(..., min_length=1, max_length=255)
    host_name: str = Field(..., min_length=1, max_length=100)
    notes: Optional[str] = None


class WatchPartyCreate(WatchPartyBase):
    """Schema for creating a watch party."""
    time_slots: List[datetime] = Field(..., min_items=1)
    participants: List[ParticipantCreate] = Field(..., min_items=1)


class WatchPartyUpdate(BaseModel):
    """Schema for updating a watch party."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    notes: Optional[str] = None
    selected_datetime: Optional[datetime] = None
    is_finalized: Optional[bool] = None


class WatchParty(WatchPartyBase):
    """Schema for watch party response."""
    id: int
    selected_datetime: Optional[datetime] = None
    is_finalized: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    time_slots: List[TimeSlot] = []
    participants: List[Participant] = []
    
    model_config = ConfigDict(from_attributes=True)


class BestTimeRecommendation(BaseModel):
    """Schema for best time recommendation."""
    time_slot_id: int
    proposed_datetime: datetime
    votes: int
    available_count: int
    total_participants: int
    availability_percentage: float
