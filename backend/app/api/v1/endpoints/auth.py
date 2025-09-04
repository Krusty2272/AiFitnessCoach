"""
Авторизация через Telegram
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.services.telegram_auth_service import get_telegram_auth_service
import structlog

router = APIRouter()
logger = structlog.get_logger()

# Настройка JWT
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Создание JWT токена"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[int]:
    """Проверка JWT токена"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except JWTError:
        return None


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Получение текущего пользователя по токену"""
    if not authorization:
        return None
    
    # Извлекаем токен из заголовка
    try:
        scheme, token = authorization.split()
        if scheme.lower() != 'bearer':
            return None
    except ValueError:
        return None
    
    user_id = verify_token(token)
    if not user_id:
        return None
    
    user = db.query(User).filter(User.telegram_id == user_id).first()
    return user


@router.post("/telegram/auth", response_model=Dict[str, Any])
async def telegram_auth(
    init_data: str,
    db: Session = Depends(get_db)
):
    """
    Авторизация через Telegram Mini App
    
    Args:
        init_data: Данные от Telegram WebApp в формате query string
    """
    try:
        # Инициализируем сервис авторизации
        auth_service = get_telegram_auth_service(settings.TELEGRAM_BOT_TOKEN or "")
        
        # Валидируем данные от Telegram
        validated_data = auth_service.validate_init_data(init_data)
        if not validated_data:
            raise HTTPException(
                status_code=401,
                detail="Invalid Telegram data"
            )
        
        # Извлекаем информацию о пользователе
        user_info = auth_service.extract_user_info(validated_data)
        if not user_info:
            raise HTTPException(
                status_code=400,
                detail="No user data in request"
            )
        
        # Ищем или создаем пользователя
        user = db.query(User).filter(User.telegram_id == user_info['telegram_id']).first()
        
        if not user:
            # Создаем нового пользователя
            user = User(
                telegram_id=user_info['telegram_id'],
                username=user_info.get('username'),
                first_name=user_info.get('first_name'),
                last_name=user_info.get('last_name'),
                language_code=user_info.get('language_code', 'ru'),
                is_premium=user_info.get('is_premium', False),
                created_at=datetime.utcnow(),
                last_active=datetime.utcnow()
            )
            db.add(user)
        else:
            # Обновляем данные существующего пользователя
            user.last_active = datetime.utcnow()
            if user_info.get('username'):
                user.username = user_info['username']
            if user_info.get('first_name'):
                user.first_name = user_info['first_name']
            if user_info.get('last_name'):
                user.last_name = user_info['last_name']
            user.is_premium = user_info.get('is_premium', False)
        
        db.commit()
        db.refresh(user)
        
        # Создаем JWT токен
        access_token = create_access_token(
            data={"sub": str(user.telegram_id)}
        )
        
        logger.info(f"User authenticated: {user.telegram_id}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "telegram_id": user.telegram_id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_premium": user.is_premium,
                "level": user.level,
                "experience": user.experience,
                "streak_days": user.streak_days
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Authentication failed"
        )


@router.get("/me", response_model=Dict[str, Any])
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """Получение данных текущего пользователя"""
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    return {
        "id": current_user.id,
        "telegram_id": current_user.telegram_id,
        "username": current_user.username,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "is_premium": current_user.is_premium,
        "level": current_user.level,
        "experience": current_user.experience,
        "streak_days": current_user.streak_days,
        "total_workouts": current_user.total_workouts,
        "total_minutes": current_user.total_minutes,
        "achievements": [],  # TODO: Load from relationship
        "preferences": current_user.preferences or {}
    }


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user)
):
    """Выход из системы"""
    # JWT токены stateless, поэтому просто возвращаем успех
    # На клиенте нужно удалить токен из localStorage
    return {"success": True, "message": "Logged out successfully"}


@router.post("/refresh", response_model=Dict[str, Any])
async def refresh_token(
    current_user: User = Depends(get_current_user)
):
    """Обновление токена"""
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    # Создаем новый токен
    access_token = create_access_token(
        data={"sub": str(current_user.telegram_id)}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/validate-token")
async def validate_token_endpoint(
    current_user: User = Depends(get_current_user)
):
    """Проверка валидности токена"""
    if not current_user:
        return {"valid": False}
    
    return {
        "valid": True,
        "user_id": current_user.telegram_id
    }