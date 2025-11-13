from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import movies


# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS - MUST be added before routes
# Allow local development and production Vercel deployments
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Add environment-based CORS origins (for production)
if settings.CORS_ORIGINS != "*":
    allowed_origins.extend(settings.cors_origins_list)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if settings.CORS_ORIGINS != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """Create database tables on startup."""
    # Import models to register them with Base
    from app.models import movie
    Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(movies.router, prefix="/api")
# app.include_router(watch_party.router, prefix="/api")  # Temporarily disabled


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API information."""
    return {
        "message": "Welcome to MovieMate API",
        "version": settings.VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )
