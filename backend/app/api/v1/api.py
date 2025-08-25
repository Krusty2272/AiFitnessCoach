"""
Main API router for MVP
"""

from fastapi import APIRouter
from app.api.v1.endpoints import users, workouts

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(workouts.router, prefix="/workouts", tags=["workouts"]) 