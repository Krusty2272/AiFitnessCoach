"""
API для отслеживания прогресса тренировок
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.user import User
from app.models.workout_history import WorkoutHistory, ExerciseHistory, ProgressMilestone, BodyMetrics
from app.api.v1.endpoints.auth import get_current_user
import structlog

router = APIRouter()
logger = structlog.get_logger()


@router.post("/workout/start", response_model=Dict[str, Any])
async def start_workout(
    workout_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Начать новую тренировку"""
    try:
        workout = WorkoutHistory(
            user_id=current_user.id,
            workout_type=workout_data.get("type", "general"),
            workout_name=workout_data.get("name", "Тренировка"),
            exercises=workout_data.get("exercises", []),
            total_exercises=len(workout_data.get("exercises", [])),
            started_at=datetime.utcnow(),
            is_ai_generated=workout_data.get("is_ai_generated", False)
        )
        
        db.add(workout)
        db.commit()
        db.refresh(workout)
        
        return {
            "workout_id": workout.id,
            "started_at": workout.started_at.isoformat(),
            "message": "Тренировка начата"
        }
        
    except Exception as e:
        logger.error(f"Error starting workout: {e}")
        raise HTTPException(status_code=500, detail="Ошибка при начале тренировки")


@router.post("/workout/{workout_id}/complete", response_model=Dict[str, Any])
async def complete_workout(
    workout_id: int,
    completion_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Завершить тренировку"""
    try:
        workout = db.query(WorkoutHistory).filter(
            WorkoutHistory.id == workout_id,
            WorkoutHistory.user_id == current_user.id
        ).first()
        
        if not workout:
            raise HTTPException(status_code=404, detail="Тренировка не найдена")
        
        # Обновляем данные тренировки
        workout.completed_at = datetime.utcnow()
        workout.duration_minutes = completion_data.get("duration_minutes", 0)
        workout.calories_burned = completion_data.get("calories_burned", 0)
        workout.completed_exercises = completion_data.get("completed_exercises", 0)
        workout.difficulty_rating = completion_data.get("difficulty_rating")
        workout.enjoyment_rating = completion_data.get("enjoyment_rating")
        workout.notes = completion_data.get("notes")
        
        # Обновляем статистику пользователя
        current_user.total_workouts += 1
        current_user.total_minutes += workout.duration_minutes
        current_user.calories_burned += workout.calories_burned
        current_user.last_workout_date = workout.completed_at
        
        # Обновляем streak
        if current_user.last_workout_date:
            last_date = current_user.last_workout_date.date()
            today = datetime.utcnow().date()
            diff_days = (today - last_date).days
            
            if diff_days == 1:
                current_user.streak_days += 1
            elif diff_days > 1:
                current_user.streak_days = 1
        else:
            current_user.streak_days = 1
        
        # Добавляем опыт
        exp_gained = (workout.duration_minutes // 10) * 10
        current_user.experience += exp_gained
        
        # Проверяем уровень
        while current_user.experience >= current_user.level * 100:
            current_user.experience -= current_user.level * 100
            current_user.level += 1
            
            # Создаем milestone для нового уровня
            milestone = ProgressMilestone(
                user_id=current_user.id,
                milestone_type="level",
                milestone_name=f"Достигнут уровень {current_user.level}",
                milestone_value=current_user.level,
                previous_value=current_user.level - 1
            )
            db.add(milestone)
        
        db.commit()
        
        return {
            "success": True,
            "exp_gained": exp_gained,
            "new_level": current_user.level,
            "new_streak": current_user.streak_days,
            "total_workouts": current_user.total_workouts
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing workout: {e}")
        raise HTTPException(status_code=500, detail="Ошибка при завершении тренировки")


@router.post("/exercise/log", response_model=Dict[str, Any])
async def log_exercise(
    exercise_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Записать выполнение упражнения"""
    try:
        exercise = ExerciseHistory(
            user_id=current_user.id,
            workout_history_id=exercise_data.get("workout_id"),
            exercise_name=exercise_data.get("name"),
            muscle_groups=exercise_data.get("muscle_groups", []),
            equipment=exercise_data.get("equipment"),
            sets_completed=exercise_data.get("sets_completed", 0),
            sets_planned=exercise_data.get("sets_planned", 0),
            reps=exercise_data.get("reps", []),
            weight=exercise_data.get("weight", []),
            duration_seconds=exercise_data.get("duration_seconds"),
            started_at=datetime.utcnow()
        )
        
        # Рассчитываем объем
        if exercise.weight and exercise.reps:
            total_volume = 0
            for w, r in zip(exercise.weight, exercise.reps):
                total_volume += w * r
            exercise.total_volume = total_volume
            exercise.max_weight = max(exercise.weight) if exercise.weight else 0
        
        db.add(exercise)
        db.commit()
        
        return {"success": True, "exercise_id": exercise.id}
        
    except Exception as e:
        logger.error(f"Error logging exercise: {e}")
        raise HTTPException(status_code=500, detail="Ошибка при записи упражнения")


@router.get("/stats/overview", response_model=Dict[str, Any])
async def get_stats_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить общую статистику пользователя"""
    try:
        # Статистика за последние 30 дней
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        recent_workouts = db.query(WorkoutHistory).filter(
            WorkoutHistory.user_id == current_user.id,
            WorkoutHistory.completed_at >= thirty_days_ago
        ).all()
        
        # Подсчеты
        total_duration_30d = sum(w.duration_minutes or 0 for w in recent_workouts)
        total_calories_30d = sum(w.calories_burned or 0 for w in recent_workouts)
        
        # Любимые упражнения
        favorite_exercises = db.query(
            ExerciseHistory.exercise_name,
            func.count(ExerciseHistory.id).label("count")
        ).filter(
            ExerciseHistory.user_id == current_user.id
        ).group_by(
            ExerciseHistory.exercise_name
        ).order_by(
            desc("count")
        ).limit(5).all()
        
        # Последние тренировки
        recent = db.query(WorkoutHistory).filter(
            WorkoutHistory.user_id == current_user.id,
            WorkoutHistory.completed_at.isnot(None)
        ).order_by(
            desc(WorkoutHistory.completed_at)
        ).limit(5).all()
        
        return {
            "total_workouts": current_user.total_workouts,
            "total_minutes": current_user.total_minutes,
            "total_calories": current_user.calories_burned,
            "current_streak": current_user.streak_days,
            "level": current_user.level,
            "experience": current_user.experience,
            "next_level_exp": current_user.level * 100,
            "stats_30d": {
                "workouts": len(recent_workouts),
                "minutes": total_duration_30d,
                "calories": total_calories_30d
            },
            "favorite_exercises": [
                {"name": ex[0], "count": ex[1]} for ex in favorite_exercises
            ],
            "recent_workouts": [
                {
                    "id": w.id,
                    "name": w.workout_name,
                    "date": w.completed_at.isoformat() if w.completed_at else None,
                    "duration": w.duration_minutes,
                    "calories": w.calories_burned
                } for w in recent
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail="Ошибка при получении статистики")


@router.get("/stats/chart/{period}", response_model=Dict[str, Any])
async def get_chart_data(
    period: str,  # week, month, year
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить данные для графиков"""
    try:
        # Определяем период
        if period == "week":
            start_date = datetime.utcnow() - timedelta(days=7)
        elif period == "month":
            start_date = datetime.utcnow() - timedelta(days=30)
        elif period == "year":
            start_date = datetime.utcnow() - timedelta(days=365)
        else:
            start_date = datetime.utcnow() - timedelta(days=30)
        
        # Получаем тренировки за период
        workouts = db.query(WorkoutHistory).filter(
            WorkoutHistory.user_id == current_user.id,
            WorkoutHistory.completed_at >= start_date,
            WorkoutHistory.completed_at.isnot(None)
        ).order_by(WorkoutHistory.completed_at).all()
        
        # Группируем по дням
        data_by_day = {}
        for workout in workouts:
            day = workout.completed_at.date().isoformat()
            if day not in data_by_day:
                data_by_day[day] = {
                    "workouts": 0,
                    "minutes": 0,
                    "calories": 0
                }
            data_by_day[day]["workouts"] += 1
            data_by_day[day]["minutes"] += workout.duration_minutes or 0
            data_by_day[day]["calories"] += workout.calories_burned or 0
        
        # Формируем данные для графика
        labels = sorted(data_by_day.keys())
        workout_counts = [data_by_day[day]["workouts"] for day in labels]
        minutes = [data_by_day[day]["minutes"] for day in labels]
        calories = [data_by_day[day]["calories"] for day in labels]
        
        return {
            "labels": labels,
            "datasets": {
                "workouts": workout_counts,
                "minutes": minutes,
                "calories": calories
            },
            "totals": {
                "workouts": sum(workout_counts),
                "minutes": sum(minutes),
                "calories": sum(calories)
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting chart data: {e}")
        raise HTTPException(status_code=500, detail="Ошибка при получении данных графика")


@router.get("/milestones", response_model=List[Dict[str, Any]])
async def get_milestones(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить достижения пользователя"""
    try:
        milestones = db.query(ProgressMilestone).filter(
            ProgressMilestone.user_id == current_user.id
        ).order_by(desc(ProgressMilestone.achieved_at)).limit(20).all()
        
        return [
            {
                "id": m.id,
                "type": m.milestone_type,
                "name": m.milestone_name,
                "value": m.milestone_value,
                "previous_value": m.previous_value,
                "achieved_at": m.achieved_at.isoformat()
            } for m in milestones
        ]
        
    except Exception as e:
        logger.error(f"Error getting milestones: {e}")
        raise HTTPException(status_code=500, detail="Ошибка при получении достижений")


@router.post("/body-metrics", response_model=Dict[str, Any])
async def add_body_metrics(
    metrics: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Добавить замеры тела"""
    try:
        body_metrics = BodyMetrics(
            user_id=current_user.id,
            weight=metrics.get("weight"),
            body_fat_percentage=metrics.get("body_fat"),
            muscle_mass=metrics.get("muscle_mass"),
            bmi=metrics.get("bmi"),
            chest=metrics.get("chest"),
            waist=metrics.get("waist"),
            hips=metrics.get("hips"),
            biceps_left=metrics.get("biceps_left"),
            biceps_right=metrics.get("biceps_right"),
            thigh_left=metrics.get("thigh_left"),
            thigh_right=metrics.get("thigh_right")
        )
        
        db.add(body_metrics)
        
        # Проверяем прогресс в весе
        previous_weight = db.query(BodyMetrics).filter(
            BodyMetrics.user_id == current_user.id,
            BodyMetrics.id != body_metrics.id
        ).order_by(desc(BodyMetrics.measured_at)).first()
        
        if previous_weight and abs(previous_weight.weight - body_metrics.weight) >= 1:
            # Создаем milestone для изменения веса
            milestone = ProgressMilestone(
                user_id=current_user.id,
                milestone_type="weight_change",
                milestone_name=f"Изменение веса: {'−' if body_metrics.weight < previous_weight.weight else '+'}{abs(body_metrics.weight - previous_weight.weight):.1f} кг",
                milestone_value=body_metrics.weight,
                previous_value=previous_weight.weight
            )
            db.add(milestone)
        
        db.commit()
        
        return {"success": True, "message": "Замеры сохранены"}
        
    except Exception as e:
        logger.error(f"Error adding body metrics: {e}")
        raise HTTPException(status_code=500, detail="Ошибка при сохранении замеров")


@router.get("/body-metrics/history", response_model=List[Dict[str, Any]])
async def get_body_metrics_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить историю замеров тела"""
    try:
        metrics = db.query(BodyMetrics).filter(
            BodyMetrics.user_id == current_user.id
        ).order_by(desc(BodyMetrics.measured_at)).limit(12).all()
        
        return [
            {
                "id": m.id,
                "weight": m.weight,
                "body_fat": m.body_fat_percentage,
                "muscle_mass": m.muscle_mass,
                "bmi": m.bmi,
                "measurements": {
                    "chest": m.chest,
                    "waist": m.waist,
                    "hips": m.hips,
                    "biceps_left": m.biceps_left,
                    "biceps_right": m.biceps_right,
                    "thigh_left": m.thigh_left,
                    "thigh_right": m.thigh_right
                },
                "date": m.measured_at.isoformat()
            } for m in metrics
        ]
        
    except Exception as e:
        logger.error(f"Error getting body metrics history: {e}")
        raise HTTPException(status_code=500, detail="Ошибка при получении истории замеров")