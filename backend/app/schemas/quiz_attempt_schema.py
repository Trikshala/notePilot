from pydantic import BaseModel
from datetime import datetime
from typing import Any


class QuizAttemptBase(BaseModel):
    difficulty: str
    num_questions: int = 5  


class QuestionResult(BaseModel):
    question: str
    options: dict[str, str]       
    correct_answer: str            
    selected_answer: str          
    is_correct: bool
    explanation: str


class QuizAttemptSubmit(BaseModel):
    difficulty: str
    answers: list[dict[str, Any]]  


class QuizAttemptResponse(BaseModel):
    id: int
    chapter_id: int
    difficulty: str
    score: int
    total_questions: int
    results: list[dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


class QuizGenerateResponse(BaseModel):
    questions: list[dict[str, Any]]  