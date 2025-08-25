"""
Exercise service for MVP
"""

from sqlalchemy.orm import Session
from app.models.workout import Exercise
from typing import List, Optional


class ExerciseService:
    """Service for exercise operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_exercises(
        self,
        muscle_group: Optional[str] = None,
        equipment: Optional[str] = None,
        difficulty: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Exercise]:
        """Get exercises with filters"""
        query = self.db.query(Exercise).filter(Exercise.is_active == True)
        
        if muscle_group:
            query = query.filter(Exercise.muscle_group == muscle_group)
        
        if equipment:
            query = query.filter(Exercise.equipment == equipment)
        
        if difficulty:
            query = query.filter(Exercise.difficulty == difficulty)
        
        return query.offset(offset).limit(limit).all()
    
    def get_exercise_by_id(self, exercise_id: int) -> Exercise:
        """Get exercise by ID"""
        return self.db.query(Exercise).filter(Exercise.id == exercise_id).first()
    
    def get_exercises_by_muscle_group(self, muscle_group: str, limit: int = 10) -> List[Exercise]:
        """Get exercises by muscle group"""
        return self.db.query(Exercise).filter(
            Exercise.muscle_group == muscle_group,
            Exercise.is_active == True
        ).limit(limit).all()
    
    def get_random_exercises(self, muscle_groups: List[str], count: int = 5) -> List[Exercise]:
        """Get random exercises for muscle groups"""
        import random
        
        exercises = []
        for muscle_group in muscle_groups:
            muscle_exercises = self.get_exercises_by_muscle_group(muscle_group, count * 2)
            if muscle_exercises:
                exercises.extend(random.sample(muscle_exercises, min(count, len(muscle_exercises))))
        
        return exercises[:count]
    
    def seed_basic_exercises(self):
        """Seed basic exercises for MVP"""
        basic_exercises = [
            # Chest exercises
            {"name": "Push-ups", "muscle_group": "chest", "equipment": "bodyweight", "difficulty": "beginner"},
            {"name": "Bench Press", "muscle_group": "chest", "equipment": "barbell", "difficulty": "intermediate"},
            {"name": "Dumbbell Flyes", "muscle_group": "chest", "equipment": "dumbbell", "difficulty": "intermediate"},
            
            # Back exercises
            {"name": "Pull-ups", "muscle_group": "back", "equipment": "bodyweight", "difficulty": "intermediate"},
            {"name": "Bent-over Rows", "muscle_group": "back", "equipment": "barbell", "difficulty": "intermediate"},
            {"name": "Lat Pulldowns", "muscle_group": "back", "equipment": "machine", "difficulty": "beginner"},
            
            # Legs exercises
            {"name": "Squats", "muscle_group": "legs", "equipment": "bodyweight", "difficulty": "beginner"},
            {"name": "Deadlifts", "muscle_group": "legs", "equipment": "barbell", "difficulty": "advanced"},
            {"name": "Lunges", "muscle_group": "legs", "equipment": "bodyweight", "difficulty": "beginner"},
            
            # Shoulders exercises
            {"name": "Overhead Press", "muscle_group": "shoulders", "equipment": "barbell", "difficulty": "intermediate"},
            {"name": "Lateral Raises", "muscle_group": "shoulders", "equipment": "dumbbell", "difficulty": "beginner"},
            
            # Arms exercises
            {"name": "Bicep Curls", "muscle_group": "arms", "equipment": "dumbbell", "difficulty": "beginner"},
            {"name": "Tricep Dips", "muscle_group": "arms", "equipment": "bodyweight", "difficulty": "intermediate"},
        ]
        
        for exercise_data in basic_exercises:
            existing = self.db.query(Exercise).filter(Exercise.name == exercise_data["name"]).first()
            if not existing:
                exercise = Exercise(**exercise_data)
                self.db.add(exercise)
        
        self.db.commit() 