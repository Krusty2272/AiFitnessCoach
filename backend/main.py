"""
AIGym Coach Backend - Main Application Entry Point
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import structlog
from prometheus_client import Counter, Histogram, REGISTRY
import time

from app.core.config import settings
from app.core.database import init_db
from app.api.v1.api import api_router

# Prometheus metrics with duplicate check
def create_counter(name, description, labels):
    # Check if counter already exists
    try:
        return REGISTRY._names_to_collectors[name]
    except KeyError:
        return Counter(name, description, labels)

def create_histogram(name, description):
    # Check if histogram already exists
    try:
        return REGISTRY._names_to_collectors[name]
    except KeyError:
        return Histogram(name, description)

REQUEST_COUNT = create_counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = create_histogram('http_request_duration_seconds', 'HTTP request latency')

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting AIGym Coach Backend")
    
    # Initialize database
    await init_db()
    logger.info("Database initialized")
    
    # Initialize basic exercises
    from app.services.exercise_service import ExerciseService
    from app.core.database import SessionLocal
    
    db = SessionLocal()
    exercise_service = ExerciseService(db)
    exercise_service.seed_basic_exercises()
    db.close()
    logger.info("Basic exercises seeded")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AIGym Coach Backend")


def create_application() -> FastAPI:
    """Create and configure FastAPI application"""
    
    app = FastAPI(
        title="AIGym Coach API",
        description="AI-Powered Fitness Platform Backend API",
        version="1.0.0",
        docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
        redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
        openapi_url="/openapi.json" if settings.ENVIRONMENT != "production" else None,
        lifespan=lifespan
    )
    
    # Add middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)
    
    # Include API router
    app.include_router(api_router, prefix="/api/v1")
    
    return app


app = create_application()


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AIGym Coach API",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "environment": settings.ENVIRONMENT
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(
        "Unhandled exception",
        exc_info=exc,
        path=request.url.path,
        method=request.method
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "type": "internal_error"
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.RELOAD_ON_CHANGE,
        log_level=settings.LOG_LEVEL.lower()
    ) 