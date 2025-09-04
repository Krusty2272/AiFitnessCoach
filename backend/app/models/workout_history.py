"""
Модель истории тренировок
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, JSON, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class WorkoutHistory(Base):
    """История тренировок пользователя"""
    __tablename__ = "workout_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Основная информация о тренировке
    workout_type = Column(String(50))  # strength, cardio, flexibility, hiit
    workout_name = Column(String(200))
    duration_minutes = Column(Integer)
    calories_burned = Column(Integer)
    
    # Детали тренировки
    exercises = Column(JSON)  # Список упражнений с подходами/повторениями
    total_exercises = Column(Integer, default=0)
    completed_exercises = Column(Integer, default=0)
    
    # Метрики производительности
    total_weight_lifted = Column(Float, default=0)  # Общий поднятый вес в кг
    total_reps = Column(Integer, default=0)  # Общее количество повторений
    total_sets = Column(Integer, default=0)  # Общее количество подходов
    avg_heart_rate = Column(Integer, nullable=True)  # Средний пульс
    max_heart_rate = Column(Integer, nullable=True)  # Максимальный пульс
    
    # Субъективные оценки
    difficulty_rating = Column(Integer, nullable=True)  # 1-5
    enjoyment_rating = Column(Integer, nullable=True)  # 1-5
    energy_level_before = Column(Integer, nullable=True)  # 1-5
    energy_level_after = Column(Integer, nullable=True)  # 1-5
    notes = Column(String(500), nullable=True)
    
    # AI сгенерированная тренировка
    is_ai_generated = Column(Boolean, default=False)
    ai_workout_id = Column(String(100), nullable=True)
    
    # Временные метки
    started_at = Column(DateTime(timezone=True), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Связь с пользователем
    user = relationship("User", backref="workout_history")


class ExerciseHistory(Base):
    """История выполнения конкретных упражнений"""
    __tablename__ = "exercise_history"
    
    id = Column(Integer, primary_key=True, index=True)
    workout_history_id = Column(Integer, ForeignKey("workout_history.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Информация об упражнении
    exercise_name = Column(String(200))
    muscle_groups = Column(JSON)  # Список задействованных мышц
    equipment = Column(String(100), nullable=True)
    
    # Выполнение
    sets_completed = Column(Integer, default=0)
    sets_planned = Column(Integer)
    reps = Column(JSON)  # Список повторений для каждого подхода [12, 10, 8]
    weight = Column(JSON)  # Список весов для каждого подхода [20, 22.5, 25]
    duration_seconds = Column(Integer, nullable=True)  # Для упражнений на время
    rest_seconds = Column(Integer, nullable=True)
    
    # Метрики
    total_volume = Column(Float, default=0)  # Общий объем (вес * повторения)
    max_weight = Column(Float, nullable=True)
    personal_record = Column(Boolean, default=False)
    
    # Форма выполнения
    form_rating = Column(Integer, nullable=True)  # 1-5
    difficulty = Column(String(20), nullable=True)  # easy, medium, hard
    notes = Column(String(200), nullable=True)
    
    # Временные метки
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Связи
    workout = relationship("WorkoutHistory", backref="exercises_detail")
    user = relationship("User", backref="exercise_history")


class ProgressMilestone(Base):
    """Вехи прогресса пользователя"""
    __tablename__ = "progress_milestones"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    milestone_type = Column(String(50))  # weight_loss, strength_gain, endurance, streak
    milestone_name = Column(String(200))
    milestone_value = Column(Float)
    previous_value = Column(Float, nullable=True)
    
    achieved_at = Column(DateTime(timezone=True), default=func.now())
    
    # Связь с пользователем
    user = relationship("User", backref="milestones")


class BodyMetrics(Base):
    """Метрики тела пользователя"""
    __tablename__ = "body_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Основные метрики
    weight = Column(Float)  # кг
    body_fat_percentage = Column(Float, nullable=True)
    muscle_mass = Column(Float, nullable=True)  # кг
    bmi = Column(Float, nullable=True)
    
    # Замеры
    chest = Column(Float, nullable=True)  # см
    waist = Column(Float, nullable=True)
    hips = Column(Float, nullable=True)
    biceps_left = Column(Float, nullable=True)
    biceps_right = Column(Float, nullable=True)
    thigh_left = Column(Float, nullable=True)
    thigh_right = Column(Float, nullable=True)
    
    # Фото прогресса
    photo_url = Column(String(500), nullable=True)
    
    # Дата измерения
    measured_at = Column(DateTime(timezone=True), default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Связь с пользователем
    user = relationship("User", backref="body_metrics")