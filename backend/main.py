from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.routers.user_routes import router as user_router
from app.routers.course_routes import router as course_router
from app.routers.chapter_routes import router as chapter_router
from app.routers.document_routes import router as document_router
from app.routers.note_routes import router as note_router
from app.routers.quiz_attempt_routes import router as quiz_router
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
app.include_router(document_router)
app.include_router(note_router)
app.include_router(quiz_router)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)