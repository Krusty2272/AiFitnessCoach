"""
User model for MVP
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.core.database import Base


class User(Base):
    """User model for MVP"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(Integer, unique=True, index=True, nullable=False)
    username = Column(String(100), nullable=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    
    # Basic fitness info
    fitness_goal = Column(String(50), nullable=True)  # 'weight_loss', 'muscle_gain', 'strength', 'endurance'
    experience_level = Column(String(50), nullable=True)  # 'beginner', 'intermediate', 'advanced'
    weight = Column(Integer, nullable=True)  # in kg
    height = Column(Integer, nullable=True)  # in cm
    age = Column(Integer, nullable=True)
    
    # App settings
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# Pydantic models for API
class UserBase(BaseModel):
    """Base user model for API"""
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(UserBase):
    """Model for creating user"""
    pass


class UserUpdate(BaseModel):
    """Model for updating user"""
    fitness_goal: Optional[str] = None
    experience_level: Optional[str] = None
    weight: Optional[int] = None
    height: Optional[int] = None
    age: Optional[int] = None


class UserResponse(UserBase):
    """Model for user response"""
    id: int
    fitness_goal: Optional[str] = None
    experience_level: Optional[str] = None
    weight: Optional[int] = None
    height: Optional[int] = None
    age: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 