"""
Main API router for MVP
"""

from fastapi import APIRouter
from app.api.v1.endpoints import users, workouts, ai, auth, progress

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(workouts.router, prefix="/workouts", tags=["workouts"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"]) 