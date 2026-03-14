from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import concurrent.futures

from app.db.session import get_db
from app.routers.user_routes import get_current_user
from app.crud.document_crud import get_documents_by_chapter
from app.crud.quiz_attempt_crud import create_quiz_attempt, get_attempts_by_chapter, get_all_attempts_by_user, delete_attempts_by_chapter
from app.schemas.quiz_attempt_schema import QuizAttemptBase, QuizAttemptSubmit, QuizAttemptResponse, QuizGenerateResponse
from app.services.quiz_generator import generate_quiz

router = APIRouter(
    prefix="/quiz",
    tags=["Quiz"]
)

VALID_DIFFICULTIES = {"easy", "medium", "hard"}

@router.post("/{chapter_id}/generate", response_model=QuizGenerateResponse)
def generate_quiz_questions(
    chapter_id: int,
    quiz_data: QuizAttemptBase,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if quiz_data.difficulty not in VALID_DIFFICULTIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid difficulty. Choose easy, medium, or hard."
        )

    if not (1 <= quiz_data.num_questions <= 20):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="num_questions must be between 1 and 20."
        )

    documents = get_documents_by_chapter(db, chapter_id, current_user.id)
    if not documents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No documents found for this chapter."
        )

    try:
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(
                generate_quiz,
                documents,
                quiz_data.difficulty,
                quiz_data.num_questions
            )
            questions = future.result(timeout=60)

    except concurrent.futures.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Quiz generation took too long. Try again."
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        print("QUIZ GENERATION ERROR:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error occurred while generating quiz."
        )

    return QuizGenerateResponse(questions=questions)


@router.post("/{chapter_id}/submit", response_model=QuizAttemptResponse)
def submit_quiz_attempt(
    chapter_id: int,
    submission: QuizAttemptSubmit,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if submission.difficulty not in VALID_DIFFICULTIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid difficulty."
        )

    if not submission.answers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No answers submitted."
        )

    results = []
    score = 0

    for ans in submission.answers:
        is_correct = ans.get("selected_answer") == ans.get("correct_answer")
        if is_correct:
            score += 1

        results.append({
            "question": ans.get("question"),
            "options": ans.get("options"),
            "correct_answer": ans.get("correct_answer"),
            "selected_answer": ans.get("selected_answer"),
            "is_correct": is_correct,
            "explanation": ans.get("explanation", "")
        })

    total_questions = len(results)

    attempt = create_quiz_attempt(
        db=db,
        chapter_id=chapter_id,
        user_id=current_user.id,
        difficulty=submission.difficulty,
        score=score,
        total_questions=total_questions,
        results=results
    )

    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found or unauthorized."
        )

    return QuizAttemptResponse.model_validate(attempt)


@router.get("/{chapter_id}/attempts", response_model=list[QuizAttemptResponse])
def get_chapter_attempts(
    chapter_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attempts = get_attempts_by_chapter(db, chapter_id, current_user.id)
    return [QuizAttemptResponse.model_validate(a) for a in attempts]


@router.get("/analytics/all", response_model=list[QuizAttemptResponse])
def get_all_attempts(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attempts = get_all_attempts_by_user(db, current_user.id)
    return [QuizAttemptResponse.model_validate(a) for a in attempts]


@router.delete("/{chapter_id}/attempts")
def delete_chapter_attempts(
    chapter_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = delete_attempts_by_chapter(db, chapter_id, current_user.id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found or no attempts to delete."
        )
    return JSONResponse(content={"detail": "Quiz attempts deleted successfully"})