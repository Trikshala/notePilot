from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.routers.user_routes import router as user_router
from app.routers.course_routes import router as course_router
from app.routers.chapter_routes import router as chapter_router
from app.db.base import Base
from app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="NotePilot API",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(user_router)
app.include_router(course_router)
app.include_router(chapter_router)

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)