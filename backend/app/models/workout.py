"""
Workout and Exercise models for MVP
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.core.database import Base


class Exercise(Base):
    """Exercise model for MVP"""
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    muscle_group = Column(String(100), nullable=True)  # 'chest', 'back', 'legs', etc.
    equipment = Column(String(100), nullable=True)  # 'barbell', 'dumbbell', 'bodyweight', etc.
    difficulty = Column(String(50), nullable=True)  # 'beginner', 'intermediate', 'advanced'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Workout(Base):
    """Workout model for MVP"""
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    workout_type = Column(String(50), nullable=True)  # 'strength', 'cardio', 'flexibility'
    duration_minutes = Column(Integer, nullable=True)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    exercises = relationship("WorkoutExercise", back_populates="workout")


class WorkoutExercise(Base):
    """Workout-Exercise relationship model"""
    __tablename__ = "workout_exercises"

    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    
    # Exercise details for this workout
    sets = Column(Integer, default=3)
    reps = Column(Integer, default=10)
    weight = Column(Float, nullable=True)  # in kg
    duration_seconds = Column(Integer, nullable=True)  # for timed exercises
    rest_seconds = Column(Integer, default=60)
    order = Column(Integer, default=0)
    
    # Completion tracking
    completed = Column(Boolean, default=False)
    completed_sets = Column(Integer, default=0)
    
    # Relationships
    workout = relationship("Workout", back_populates="exercises")
    exercise = relationship("Exercise")


# Pydantic models for API
class ExerciseBase(BaseModel):
    """Base exercise model for API"""
    name: str
    description: Optional[str] = None
    muscle_group: Optional[str] = None
    equipment: Optional[str] = None
    difficulty: Optional[str] = None


class ExerciseResponse(ExerciseBase):
    """Model for exercise response"""
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class WorkoutExerciseBase(BaseModel):
    """Base workout exercise model for API"""
    exercise_id: int
    sets: int = 3
    reps: int = 10
    weight: Optional[float] = None
    duration_seconds: Optional[int] = None
    rest_seconds: int = 60
    order: int = 0


class WorkoutExerciseCreate(WorkoutExerciseBase):
    """Model for creating workout exercise"""
    pass


class WorkoutExerciseResponse(WorkoutExerciseBase):
    """Model for workout exercise response"""
    id: int
    completed: bool
    completed_sets: int
    exercise: ExerciseResponse

    class Config:
        from_attributes = True


class WorkoutBase(BaseModel):
    """Base workout model for API"""
    name: str
    workout_type: Optional[str] = None
    duration_minutes: Optional[int] = None


class WorkoutCreate(WorkoutBase):
    """Model for creating workout"""
    exercises: List[WorkoutExerciseCreate] = []


class WorkoutUpdate(BaseModel):
    """Model for updating workout"""
    name: Optional[str] = None
    workout_type: Optional[str] = None
    duration_minutes: Optional[int] = None
    completed: Optional[bool] = None


class WorkoutResponse(WorkoutBase):
    """Model for workout response"""
    id: int
    user_id: int
    completed: bool
    completed_at: Optional[datetime] = None
    created_at: datetime
    exercises: List[WorkoutExerciseResponse] = []

    class Config:
        from_attributes = True 