"""
AI Service для генерации тренировок через Google Gemini
"""

import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
import google.generativeai as genai
from pydantic import BaseModel
import structlog

logger = structlog.get_logger()


class UserProfile(BaseModel):
    """Профиль пользователя для генерации тренировок"""
    age: int
    weight: float  # kg
    height: float  # cm
    fitness_level: str  # beginner, intermediate, advanced
    goals: List[str]  # muscle_gain, weight_loss, endurance, strength
    injuries: Optional[List[str]] = []
    available_equipment: Optional[List[str]] = []
    workout_duration: int = 45  # minutes
    days_per_week: int = 3


class Exercise(BaseModel):
    """Модель упражнения"""
    name: str
    sets: int
    reps: str  # может быть диапазон "8-12" или время "30 sec"
    rest_seconds: int
    muscle_groups: List[str]
    equipment: Optional[str] = None
    notes: Optional[str] = None
    difficulty: str  # easy, medium, hard


class Workout(BaseModel):
    """Модель тренировки"""
    title: str
    description: str
    duration_minutes: int
    difficulty: str
    exercises: List[Exercise]
    warmup: List[Dict[str, Any]]
    cooldown: List[Dict[str, Any]]
    tips: List[str]
    calories_burned: int


class GeminiAIService:
    def __init__(self, api_key: Optional[str] = None):
        """Инициализация Gemini AI сервиса"""
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("Gemini API key not configured")
            self.model = None
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            logger.info("Gemini AI service initialized")

    def generate_workout(self, user_profile: UserProfile) -> Optional[Workout]:
        """Генерация персонализированной тренировки"""
        if not self.model:
            logger.error("Gemini model not initialized")
            return self._get_fallback_workout(user_profile)

        try:
            prompt = self._build_workout_prompt(user_profile)
            response = self.model.generate_content(prompt)
            
            # Парсим JSON из ответа
            workout_data = self._parse_gemini_response(response.text)
            if workout_data:
                return Workout(**workout_data)
            
            # Если не удалось распарсить, возвращаем fallback
            return self._get_fallback_workout(user_profile)
            
        except Exception as e:
            logger.error(f"Error generating workout with Gemini: {e}")
            return self._get_fallback_workout(user_profile)

    def _build_workout_prompt(self, profile: UserProfile) -> str:
        """Построение промпта для Gemini"""
        equipment_str = ", ".join(profile.available_equipment) if profile.available_equipment else "bodyweight only"
        injuries_str = ", ".join(profile.injuries) if profile.injuries else "none"
        goals_str = ", ".join(profile.goals)
        
        prompt = f"""
        Generate a personalized workout plan in JSON format for:
        - Age: {profile.age}
        - Weight: {profile.weight} kg
        - Height: {profile.height} cm
        - Fitness level: {profile.fitness_level}
        - Goals: {goals_str}
        - Injuries/limitations: {injuries_str}
        - Available equipment: {equipment_str}
        - Workout duration: {profile.workout_duration} minutes
        
        Return ONLY valid JSON with this structure:
        {{
            "title": "Workout name",
            "description": "Brief description",
            "duration_minutes": {profile.workout_duration},
            "difficulty": "{profile.fitness_level}",
            "exercises": [
                {{
                    "name": "Exercise name",
                    "sets": 3,
                    "reps": "10-12",
                    "rest_seconds": 60,
                    "muscle_groups": ["chest", "shoulders"],
                    "equipment": "dumbbells",
                    "notes": "Keep core engaged",
                    "difficulty": "medium"
                }}
            ],
            "warmup": [
                {{"name": "Arm circles", "duration": "30 sec"}},
                {{"name": "Leg swings", "duration": "30 sec each leg"}}
            ],
            "cooldown": [
                {{"name": "Chest stretch", "duration": "30 sec"}},
                {{"name": "Shoulder stretch", "duration": "30 sec each"}}
            ],
            "tips": [
                "Stay hydrated",
                "Focus on form over weight"
            ],
            "calories_burned": 300
        }}
        """
        return prompt

    def _parse_gemini_response(self, response_text: str) -> Optional[Dict]:
        """Парсинг ответа от Gemini"""
        try:
            # Пытаемся найти JSON в тексте
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
            
            return None
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response: {e}")
            return None

    def _get_fallback_workout(self, profile: UserProfile) -> Workout:
        """Возвращает базовую тренировку если AI недоступен"""
        if profile.fitness_level == "beginner":
            return self._get_beginner_workout(profile)
        elif profile.fitness_level == "intermediate":
            return self._get_intermediate_workout(profile)
        else:
            return self._get_advanced_workout(profile)

    def _get_beginner_workout(self, profile: UserProfile) -> Workout:
        """Базовая тренировка для начинающих"""
        return Workout(
            title="Full Body Workout - Beginner",
            description="Простая тренировка на все группы мышц для начинающих",
            duration_minutes=profile.workout_duration,
            difficulty="beginner",
            exercises=[
                Exercise(
                    name="Отжимания с колен",
                    sets=3,
                    reps="8-10",
                    rest_seconds=60,
                    muscle_groups=["грудь", "плечи", "трицепс"],
                    equipment=None,
                    notes="Держите корпус прямым",
                    difficulty="easy"
                ),
                Exercise(
                    name="Приседания",
                    sets=3,
                    reps="10-12",
                    rest_seconds=60,
                    muscle_groups=["квадрицепс", "ягодицы"],
                    equipment=None,
                    notes="Не выводите колени за носки",
                    difficulty="easy"
                ),
                Exercise(
                    name="Планка",
                    sets=3,
                    reps="30 сек",
                    rest_seconds=45,
                    muscle_groups=["пресс", "кор"],
                    equipment=None,
                    notes="Держите тело прямым",
                    difficulty="easy"
                ),
                Exercise(
                    name="Выпады",
                    sets=3,
                    reps="10 на каждую ногу",
                    rest_seconds=60,
                    muscle_groups=["квадрицепс", "ягодицы"],
                    equipment=None,
                    notes="Контролируйте баланс",
                    difficulty="easy"
                ),
                Exercise(
                    name="Подъемы на носки",
                    sets=3,
                    reps="15-20",
                    rest_seconds=45,
                    muscle_groups=["икры"],
                    equipment=None,
                    notes="Полная амплитуда движения",
                    difficulty="easy"
                )
            ],
            warmup=[
                {"name": "Круговые движения руками", "duration": "30 сек"},
                {"name": "Махи ногами", "duration": "30 сек на каждую"},
                {"name": "Наклоны корпуса", "duration": "30 сек"}
            ],
            cooldown=[
                {"name": "Растяжка груди", "duration": "30 сек"},
                {"name": "Растяжка квадрицепса", "duration": "30 сек на каждую"},
                {"name": "Растяжка икр", "duration": "30 сек на каждую"}
            ],
            tips=[
                "Пейте воду во время тренировки",
                "Следите за техникой выполнения",
                "Не торопитесь, качество важнее количества"
            ],
            calories_burned=200
        )

    def _get_intermediate_workout(self, profile: UserProfile) -> Workout:
        """Базовая тренировка для среднего уровня"""
        return Workout(
            title="Upper Body Focus - Intermediate",
            description="Интенсивная тренировка верхней части тела",
            duration_minutes=profile.workout_duration,
            difficulty="intermediate",
            exercises=[
                Exercise(
                    name="Отжимания",
                    sets=4,
                    reps="12-15",
                    rest_seconds=45,
                    muscle_groups=["грудь", "плечи", "трицепс"],
                    equipment=None,
                    notes="Полная амплитуда",
                    difficulty="medium"
                ),
                Exercise(
                    name="Берпи",
                    sets=3,
                    reps="10",
                    rest_seconds=60,
                    muscle_groups=["все тело"],
                    equipment=None,
                    notes="Взрывное движение",
                    difficulty="medium"
                ),
                Exercise(
                    name="Алмазные отжимания",
                    sets=3,
                    reps="8-10",
                    rest_seconds=60,
                    muscle_groups=["трицепс", "грудь"],
                    equipment=None,
                    notes="Руки в форме алмаза",
                    difficulty="medium"
                ),
                Exercise(
                    name="Планка с подъемом ног",
                    sets=3,
                    reps="10 на каждую",
                    rest_seconds=45,
                    muscle_groups=["пресс", "ягодицы"],
                    equipment=None,
                    notes="Не прогибайте спину",
                    difficulty="medium"
                ),
                Exercise(
                    name="Прыжки с приседанием",
                    sets=4,
                    reps="12",
                    rest_seconds=60,
                    muscle_groups=["ноги", "ягодицы"],
                    equipment=None,
                    notes="Мягкое приземление",
                    difficulty="medium"
                ),
                Exercise(
                    name="Отжимания с широкой постановкой",
                    sets=3,
                    reps="10-12",
                    rest_seconds=45,
                    muscle_groups=["грудь"],
                    equipment=None,
                    notes="Руки шире плеч",
                    difficulty="medium"
                )
            ],
            warmup=[
                {"name": "Прыжки на месте", "duration": "1 мин"},
                {"name": "Динамическая растяжка рук", "duration": "1 мин"},
                {"name": "Вращения корпуса", "duration": "30 сек"}
            ],
            cooldown=[
                {"name": "Растяжка трицепса", "duration": "30 сек на каждую"},
                {"name": "Растяжка плеч", "duration": "30 сек на каждую"},
                {"name": "Растяжка спины", "duration": "45 сек"}
            ],
            tips=[
                "Контролируйте дыхание",
                "Увеличивайте интенсивность постепенно",
                "Отдыхайте между подходами"
            ],
            calories_burned=350
        )

    def _get_advanced_workout(self, profile: UserProfile) -> Workout:
        """Базовая тренировка для продвинутых"""
        return Workout(
            title="HIIT Total Body - Advanced",
            description="Высокоинтенсивная интервальная тренировка",
            duration_minutes=profile.workout_duration,
            difficulty="advanced",
            exercises=[
                Exercise(
                    name="Берпи с отжиманием",
                    sets=5,
                    reps="15",
                    rest_seconds=30,
                    muscle_groups=["все тело"],
                    equipment=None,
                    notes="Максимальная скорость",
                    difficulty="hard"
                ),
                Exercise(
                    name="Прыжки на тумбу (высокие приседания)",
                    sets=4,
                    reps="12",
                    rest_seconds=45,
                    muscle_groups=["ноги", "ягодицы"],
                    equipment=None,
                    notes="Взрывная сила",
                    difficulty="hard"
                ),
                Exercise(
                    name="Отжимания с хлопком",
                    sets=4,
                    reps="10",
                    rest_seconds=60,
                    muscle_groups=["грудь", "плечи"],
                    equipment=None,
                    notes="Взрывное движение вверх",
                    difficulty="hard"
                ),
                Exercise(
                    name="Пистолетик (приседания на одной ноге)",
                    sets=3,
                    reps="8 на каждую",
                    rest_seconds=60,
                    muscle_groups=["квадрицепс", "ягодицы", "баланс"],
                    equipment=None,
                    notes="Полный контроль движения",
                    difficulty="hard"
                ),
                Exercise(
                    name="Планка с прыжками",
                    sets=4,
                    reps="20",
                    rest_seconds=30,
                    muscle_groups=["пресс", "кардио"],
                    equipment=None,
                    notes="Держите корпус стабильным",
                    difficulty="hard"
                ),
                Exercise(
                    name="Подтягивания (или негативные)",
                    sets=4,
                    reps="8-10",
                    rest_seconds=60,
                    muscle_groups=["спина", "бицепс"],
                    equipment="турник",
                    notes="Полная амплитуда",
                    difficulty="hard"
                )
            ],
            warmup=[
                {"name": "Легкий бег на месте", "duration": "2 мин"},
                {"name": "Динамическая растяжка всего тела", "duration": "3 мин"},
                {"name": "Активация кора", "duration": "1 мин"}
            ],
            cooldown=[
                {"name": "Растяжка всего тела", "duration": "5 мин"},
                {"name": "Дыхательные упражнения", "duration": "2 мин"}
            ],
            tips=[
                "Работайте на пределе возможностей",
                "Следите за пульсом",
                "Обязательная заминка после тренировки",
                "Восстановление так же важно как тренировка"
            ],
            calories_burned=500
        )

    def generate_meal_plan(self, user_profile: UserProfile) -> Optional[Dict]:
        """Генерация плана питания"""
        if not self.model:
            return self._get_fallback_meal_plan(user_profile)

        try:
            prompt = self._build_meal_prompt(user_profile)
            response = self.model.generate_content(prompt)
            return self._parse_gemini_response(response.text)
        except Exception as e:
            logger.error(f"Error generating meal plan: {e}")
            return self._get_fallback_meal_plan(user_profile)

    def _build_meal_prompt(self, profile: UserProfile) -> str:
        """Построение промпта для плана питания"""
        goals_str = ", ".join(profile.goals)
        
        prompt = f"""
        Create a daily meal plan for:
        - Weight: {profile.weight} kg
        - Height: {profile.height} cm
        - Goals: {goals_str}
        - Activity level: {profile.days_per_week} workouts per week
        
        Return JSON with meals, calories, and macros.
        """
        return prompt

    def _get_fallback_meal_plan(self, profile: UserProfile) -> Dict:
        """Базовый план питания"""
        # Расчет калорий по формуле Миффлина-Сан Жеора
        if profile.weight and profile.height and profile.age:
            bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
            activity_factor = 1.2 + (profile.days_per_week * 0.1)
            daily_calories = int(bmr * activity_factor)
        else:
            daily_calories = 2000

        return {
            "daily_calories": daily_calories,
            "meals": [
                {
                    "name": "Завтрак",
                    "calories": int(daily_calories * 0.3),
                    "items": ["Овсянка с ягодами", "Яйца", "Тост с авокадо"]
                },
                {
                    "name": "Обед",
                    "calories": int(daily_calories * 0.35),
                    "items": ["Куриная грудка", "Рис", "Салат"]
                },
                {
                    "name": "Ужин",
                    "calories": int(daily_calories * 0.25),
                    "items": ["Рыба", "Овощи на пару", "Киноа"]
                },
                {
                    "name": "Перекусы",
                    "calories": int(daily_calories * 0.1),
                    "items": ["Орехи", "Протеиновый батончик", "Фрукты"]
                }
            ],
            "macros": {
                "protein": f"{int(profile.weight * 2)}g",
                "carbs": f"{int(daily_calories * 0.4 / 4)}g",
                "fats": f"{int(daily_calories * 0.3 / 9)}g"
            },
            "water": f"{int(profile.weight * 0.033)} литров"
        }


# Экспорт для использования в других модулях
ai_service = GeminiAIService()