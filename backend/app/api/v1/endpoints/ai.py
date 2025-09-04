"""
AI Endpoints для генерации тренировок и планов питания
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.services.ai_service import ai_service, UserProfile, Workout
from app.models.user import User
import structlog

router = APIRouter()
logger = structlog.get_logger()


@router.post("/generate-workout", response_model=Dict[str, Any])
async def generate_workout(
    user_profile: UserProfile,
    db: Session = Depends(get_db)
):
    """
    Генерация персонализированной тренировки на основе профиля пользователя
    
    Parameters:
    - age: возраст
    - weight: вес в кг
    - height: рост в см
    - fitness_level: beginner/intermediate/advanced
    - goals: список целей (muscle_gain, weight_loss, endurance, strength)
    - injuries: список травм (опционально)
    - available_equipment: доступное оборудование (опционально)
    - workout_duration: длительность тренировки в минутах
    - days_per_week: количество тренировок в неделю
    """
    try:
        workout = ai_service.generate_workout(user_profile)
        
        if not workout:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate workout"
            )
        
        # Логируем успешную генерацию
        logger.info(
            "Workout generated",
            fitness_level=user_profile.fitness_level,
            goals=user_profile.goals
        )
        
        return workout.dict()
        
    except Exception as e:
        logger.error(f"Error generating workout: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating workout: {str(e)}"
        )


@router.post("/generate-meal-plan", response_model=Dict[str, Any])
async def generate_meal_plan(
    user_profile: UserProfile,
    db: Session = Depends(get_db)
):
    """
    Генерация плана питания на основе профиля пользователя
    """
    try:
        meal_plan = ai_service.generate_meal_plan(user_profile)
        
        if not meal_plan:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate meal plan"
            )
        
        logger.info(
            "Meal plan generated",
            weight=user_profile.weight,
            goals=user_profile.goals
        )
        
        return meal_plan
        
    except Exception as e:
        logger.error(f"Error generating meal plan: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating meal plan: {str(e)}"
        )


@router.post("/analyze-form", response_model=Dict[str, Any])
async def analyze_exercise_form(
    exercise_name: str,
    video_url: str = None,
    description: str = None,
    db: Session = Depends(get_db)
):
    """
    Анализ техники выполнения упражнения (заглушка для будущей функциональности)
    """
    # TODO: Implement video analysis with Gemini Vision API
    return {
        "exercise": exercise_name,
        "feedback": [
            "Держите спину прямо",
            "Контролируйте движение",
            "Следите за дыханием"
        ],
        "score": 85,
        "improvements": [
            "Увеличьте амплитуду движения",
            "Замедлите темп выполнения"
        ]
    }


@router.get("/workout-templates/{level}")
async def get_workout_templates(
    level: str,
    db: Session = Depends(get_db)
):
    """
    Получение готовых шаблонов тренировок по уровню подготовки
    """
    templates = {
        "beginner": [
            {
                "id": 1,
                "name": "Полное тело для начинающих",
                "duration": 30,
                "exercises_count": 5,
                "equipment": "без оборудования"
            },
            {
                "id": 2,
                "name": "Кардио старт",
                "duration": 20,
                "exercises_count": 4,
                "equipment": "без оборудования"
            }
        ],
        "intermediate": [
            {
                "id": 3,
                "name": "Верх тела",
                "duration": 45,
                "exercises_count": 8,
                "equipment": "гантели"
            },
            {
                "id": 4,
                "name": "HIIT тренировка",
                "duration": 30,
                "exercises_count": 6,
                "equipment": "без оборудования"
            }
        ],
        "advanced": [
            {
                "id": 5,
                "name": "Силовая программа",
                "duration": 60,
                "exercises_count": 10,
                "equipment": "полный набор"
            },
            {
                "id": 6,
                "name": "Экстремальное кардио",
                "duration": 45,
                "exercises_count": 8,
                "equipment": "минимальное"
            }
        ]
    }
    
    if level not in templates:
        raise HTTPException(
            status_code=400,
            detail="Invalid fitness level. Choose from: beginner, intermediate, advanced"
        )
    
    return templates[level]


@router.post("/save-workout")
async def save_generated_workout(
    workout: Dict[str, Any],
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Сохранение сгенерированной тренировки в профиль пользователя
    """
    try:
        # TODO: Implement saving to database
        logger.info(f"Saving workout for user {user_id}")
        
        return {
            "success": True,
            "message": "Workout saved successfully",
            "workout_id": 12345  # Mock ID
        }
        
    except Exception as e:
        logger.error(f"Error saving workout: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to save workout"
        )