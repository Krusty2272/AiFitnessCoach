"""
User service for MVP
"""

from sqlalchemy.orm import Session
from app.models.user import User, UserCreate, UserUpdate
from datetime import datetime


class UserService:
    """Service for user operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_user(self, user_data: UserCreate) -> User:
        """Create new user"""
        # Check if user already exists
        existing_user = self.get_user_by_telegram_id(user_data.telegram_id)
        if existing_user:
            return existing_user
        
        # Create new user
        db_user = User(
            telegram_id=user_data.telegram_id,
            username=user_data.username,
            first_name=user_data.first_name,
            last_name=user_data.last_name
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
    
    def get_user_by_telegram_id(self, telegram_id: int) -> User:
        """Get user by Telegram ID"""
        return self.db.query(User).filter(User.telegram_id == telegram_id).first()
    
    def get_user_by_id(self, user_id: int) -> User:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def update_user(self, telegram_id: int, user_data: UserUpdate) -> User:
        """Update user profile"""
        user = self.get_user_by_telegram_id(telegram_id)
        if not user:
            return None
        
        # Update fields
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def user_exists(self, telegram_id: int) -> bool:
        """Check if user exists"""
        user = self.get_user_by_telegram_id(telegram_id)
        return user is not None
    
    def get_user_id_by_telegram_id(self, telegram_id: int) -> int:
        """Get user ID by Telegram ID"""
        user = self.get_user_by_telegram_id(telegram_id)
        return user.id if user else None 