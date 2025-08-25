"""
User API endpoints for MVP
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User, UserCreate, UserUpdate, UserResponse
from app.services.user_service import UserService

router = APIRouter()


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create new user"""
    user_service = UserService(db)
    return user_service.create_user(user_data)


@router.get("/{telegram_id}", response_model=UserResponse)
def get_user(telegram_id: int, db: Session = Depends(get_db)):
    """Get user by Telegram ID"""
    user_service = UserService(db)
    user = user_service.get_user_by_telegram_id(telegram_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/{telegram_id}", response_model=UserResponse)
def update_user(telegram_id: int, user_data: UserUpdate, db: Session = Depends(get_db)):
    """Update user profile"""
    user_service = UserService(db)
    user = user_service.update_user(telegram_id, user_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.get("/{telegram_id}/exists")
def check_user_exists(telegram_id: int, db: Session = Depends(get_db)):
    """Check if user exists"""
    user_service = UserService(db)
    exists = user_service.user_exists(telegram_id)
    return {"exists": exists} 