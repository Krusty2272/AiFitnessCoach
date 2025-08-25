"""
Workout service for MVP
"""

from sqlalchemy.orm import Session
from app.models.workout import Workout, WorkoutExercise, WorkoutCreate, WorkoutUpdate
from app.services.user_service import UserService
from app.services.exercise_service import ExerciseService
from datetime import datetime
from typing import List


class WorkoutService:
    """Service for workout operations"""
    
    def __init__(self, db: Session):
        self.db = db
        self.user_service = UserService(db)
        self.exercise_service = ExerciseService(db)
    
    def create_workout(self, telegram_id: int, workout_data: WorkoutCreate) -> Workout:
        """Create new workout"""
        # Get user ID
        user_id = self.user_service.get_user_id_by_telegram_id(telegram_id)
        if not user_id:
            raise ValueError("User not found")
        
        # Create workout
        workout = Workout(
            user_id=user_id,
            name=workout_data.name,
            workout_type=workout_data.workout_type,
            duration_minutes=workout_data.duration_minutes
        )
        
        self.db.add(workout)
        self.db.commit()
        self.db.refresh(workout)
        
        # Add exercises
        for i, exercise_data in enumerate(workout_data.exercises):
            workout_exercise = WorkoutExercise(
                workout_id=workout.id,
                exercise_id=exercise_data.exercise_id,
                sets=exercise_data.sets,
                reps=exercise_data.reps,
                weight=exercise_data.weight,
                duration_seconds=exercise_data.duration_seconds,
                rest_seconds=exercise_data.rest_seconds,
                order=i
            )
            self.db.add(workout_exercise)
        
        self.db.commit()
        self.db.refresh(workout)
        return workout
    
    def get_user_workouts(self, telegram_id: int, limit: int = 10, offset: int = 0) -> List[Workout]:
        """Get user workouts"""
        user_id = self.user_service.get_user_id_by_telegram_id(telegram_id)
        if not user_id:
            return []
        
        return self.db.query(Workout).filter(
            Workout.user_id == user_id
        ).order_by(Workout.created_at.desc()).offset(offset).limit(limit).all()
    
    def get_workout(self, workout_id: int) -> Workout:
        """Get workout by ID"""
        return self.db.query(Workout).filter(Workout.id == workout_id).first()
    
    def update_workout(self, workout_id: int, workout_data: WorkoutUpdate) -> Workout:
        """Update workout"""
        workout = self.get_workout(workout_id)
        if not workout:
            return None
        
        # Update fields
        update_data = workout_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(workout, field, value)
        
        self.db.commit()
        self.db.refresh(workout)
        return workout
    
    def complete_workout(self, workout_id: int) -> Workout:
        """Mark workout as completed"""
        workout = self.get_workout(workout_id)
        if not workout:
            return None
        
        workout.completed = True
        workout.completed_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(workout)
        return workout
    
    def generate_simple_workout(
        self,
        telegram_id: int,
        workout_type: str = "strength",
        muscle_groups: List[str] = None
    ) -> Workout:
        """Generate simple workout for MVP"""
        if muscle_groups is None:
            muscle_groups = ["chest", "back"]
        
        # Get user
        user_id = self.user_service.get_user_id_by_telegram_id(telegram_id)
        if not user_id:
            raise ValueError("User not found")
        
        # Get random exercises
        exercises = self.exercise_service.get_random_exercises(muscle_groups, 4)
        
        # Create workout
        workout_name = f"{workout_type.title()} Workout - {', '.join(muscle_groups).title()}"
        workout = Workout(
            user_id=user_id,
            name=workout_name,
            workout_type=workout_type,
            duration_minutes=45
        )
        
        self.db.add(workout)
        self.db.commit()
        self.db.refresh(workout)
        
        # Add exercises to workout
        for i, exercise in enumerate(exercises):
            workout_exercise = WorkoutExercise(
                workout_id=workout.id,
                exercise_id=exercise.id,
                sets=3,
                reps=10,
                rest_seconds=60,
                order=i
            )
            self.db.add(workout_exercise)
        
        self.db.commit()
        self.db.refresh(workout)
        return workout 