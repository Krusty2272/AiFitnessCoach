"""
AIGym Coach Backend Configuration
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "0.0.0.0"]
    
    # Database - using SQLite for local development to avoid PostgreSQL dependency
    DATABASE_URL: str = "sqlite:///./aigym_coach.db"
    DATABASE_TEST_URL: str = "sqlite:///./aigym_coach_test.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_CACHE_URL: str = "redis://localhost:6379/1"
    REDIS_SESSION_URL: str = "redis://localhost:6379/2"
    
    # AI Services
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GOOGLE_CLOUD_PROJECT_ID: Optional[str] = None
    
    # Telegram
    TELEGRAM_BOT_TOKEN: Optional[str] = None
    TELEGRAM_WEBHOOK_URL: Optional[str] = None
    TELEGRAM_MINIAPP_URL: Optional[str] = None
    
    # Payment Systems
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    YUKASSA_SECRET_KEY: Optional[str] = None
    YUKASSA_SHOP_ID: Optional[str] = None
    
    # File Storage
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET: str = "aigym-coach-storage"
    
    YANDEX_CLOUD_ACCESS_KEY_ID: Optional[str] = None
    YANDEX_CLOUD_SECRET_ACCESS_KEY: Optional[str] = None
    YANDEX_CLOUD_BUCKET: str = "aigym-coach-storage"
    
    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SENDGRID_API_KEY: Optional[str] = None
    
    # Monitoring
    SENTRY_DSN: Optional[str] = None
    GOOGLE_ANALYTICS_ID: Optional[str] = None
    MIXPANEL_TOKEN: Optional[str] = None
    
    # Health and Fitness APIs
    APPLE_HEALTHKIT_ENABLED: bool = True
    GOOGLE_FIT_ENABLED: bool = True
    MI_FIT_ENABLED: bool = True
    
    # Security
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://your-domain.com"]
    JWT_SECRET_KEY: str = "your-jwt-secret-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/3"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/4"
    CELERY_TASK_SERIALIZER: str = "json"
    CELERY_RESULT_SERIALIZER: str = "json"
    CELERY_ACCEPT_CONTENT: List[str] = ["json"]
    CELERY_TIMEZONE: str = "UTC"
    CELERY_ENABLE_UTC: bool = True
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/aigym_coach.log"
    
    # Feature Flags
    ENABLE_AI_FEATURES: bool = True
    ENABLE_PAYMENT_FEATURES: bool = True
    ENABLE_SOCIAL_FEATURES: bool = True
    ENABLE_ANALYTICS: bool = True
    
    # Development
    RELOAD_ON_CHANGE: bool = True
    AUTO_MIGRATE: bool = True
    SEED_DATA: bool = True
    
    # Testing
    TESTING: bool = False
    TEST_DATABASE_URL: str = "sqlite:///./aigym_coach_test.db"
    
    # Performance
    CACHE_TTL: int = 3600
    SESSION_TIMEOUT: int = 86400
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    
    # External Services
    HEALTH_CHECK_URL: str = "https://your-domain.com/health"
    API_DOCS_URL: str = "https://your-domain.com/docs"
    
    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @validator("ALLOWED_HOSTS", pre=True)
    def assemble_allowed_hosts(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings() 