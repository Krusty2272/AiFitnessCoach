"""
User model for MVP
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, JSON
from sqlalchemy.sql import func
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.core.database import Base


class User(Base):
    """User model with extended fields for Telegram integration"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(Integer, unique=True, index=True, nullable=False)
    username = Column(String(100), nullable=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    language_code = Column(String(10), default='ru')
    is_premium = Column(Boolean, default=False)
    
    # Fitness profile
    fitness_goal = Column(String(50), nullable=True)  # 'weight_loss', 'muscle_gain', 'strength', 'endurance'
    experience_level = Column(String(50), nullable=True)  # 'beginner', 'intermediate', 'advanced'
    weight = Column(Float, nullable=True)  # in kg
    height = Column(Float, nullable=True)  # in cm
    age = Column(Integer, nullable=True)
    goals = Column(JSON, default=list)  # Multiple goals
    
    # Progress tracking
    level = Column(Integer, default=1)
    experience = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    last_workout_date = Column(DateTime(timezone=True), nullable=True)
    total_workouts = Column(Integer, default=0)
    total_minutes = Column(Integer, default=0)
    calories_burned = Column(Integer, default=0)
    
    # Settings
    preferences = Column(JSON, default=dict)
    notification_settings = Column(JSON, default=dict)
    
    # System fields
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_active = Column(DateTime(timezone=True), default=func.now())


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