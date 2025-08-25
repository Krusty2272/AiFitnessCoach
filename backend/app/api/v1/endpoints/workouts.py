"""
Workout API endpoints for MVP
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.workout import (
    WorkoutCreate, WorkoutUpdate, WorkoutResponse,
    ExerciseResponse, WorkoutExerciseCreate
)
from app.services.workout_service import WorkoutService
from app.services.exercise_service import ExerciseService

router = APIRouter()


@router.post("/", response_model=WorkoutResponse, status_code=status.HTTP_201_CREATED)
def create_workout(
    workout_data: WorkoutCreate,
    telegram_id: int = Query(..., description="User Telegram ID"),
    db: Session = Depends(get_db)
):
    """Create new workout"""
    workout_service = WorkoutService(db)
    return workout_service.create_workout(telegram_id, workout_data)


@router.get("/", response_model=List[WorkoutResponse])
def get_user_workouts(
    telegram_id: int = Query(..., description="User Telegram ID"),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get user workouts"""
    workout_service = WorkoutService(db)
    return workout_service.get_user_workouts(telegram_id, limit, offset)


@router.get("/{workout_id}", response_model=WorkoutResponse)
def get_workout(workout_id: int, db: Session = Depends(get_db)):
    """Get workout by ID"""
    workout_service = WorkoutService(db)
    workout = workout_service.get_workout(workout_id)
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    return workout


@router.put("/{workout_id}", response_model=WorkoutResponse)
def update_workout(
    workout_id: int,
    workout_data: WorkoutUpdate,
    db: Session = Depends(get_db)
):
    """Update workout"""
    workout_service = WorkoutService(db)
    workout = workout_service.update_workout(workout_id, workout_data)
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    return workout


@router.post("/{workout_id}/complete", response_model=WorkoutResponse)
def complete_workout(workout_id: int, db: Session = Depends(get_db)):
    """Mark workout as completed"""
    workout_service = WorkoutService(db)
    workout = workout_service.complete_workout(workout_id)
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    return workout


@router.get("/exercises/", response_model=List[ExerciseResponse])
def get_exercises(
    muscle_group: str = Query(None, description="Filter by muscle group"),
    equipment: str = Query(None, description="Filter by equipment"),
    difficulty: str = Query(None, description="Filter by difficulty"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get available exercises"""
    exercise_service = ExerciseService(db)
    return exercise_service.get_exercises(muscle_group, equipment, difficulty, limit, offset)


@router.post("/generate/", response_model=WorkoutResponse)
def generate_workout(
    telegram_id: int = Query(..., description="User Telegram ID"),
    workout_type: str = Query("strength", description="Type of workout"),
    muscle_groups: List[str] = Query(["chest", "back"], description="Target muscle groups"),
    db: Session = Depends(get_db)
):
    """Generate simple workout"""
    workout_service = WorkoutService(db)
    return workout_service.generate_simple_workout(telegram_id, workout_type, muscle_groups) 