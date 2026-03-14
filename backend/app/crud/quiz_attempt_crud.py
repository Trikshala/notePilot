from sqlalchemy.orm import Session
from app.models.quiz_attempt import QuizAttempt
from app.models.chapter import Chapter
from app.models.course import Course


def create_quiz_attempt(db: Session, chapter_id: int, user_id: int, difficulty: str, score: int, total_questions: int, results: list):

    chapter = db.query(Chapter)\
        .join(Course)\
        .filter(
            Chapter.id == chapter_id,
            Course.user_id == user_id
        )\
        .first()

    if not chapter:
        return None

    attempt = QuizAttempt(
        chapter_id=chapter_id,
        difficulty=difficulty,
        score=score,
        total_questions=total_questions,
        results=results
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


def get_attempts_by_chapter(db: Session, chapter_id: int, user_id: int):

    return db.query(QuizAttempt)\
        .join(Chapter)\
        .join(Course)\
        .filter(
            QuizAttempt.chapter_id == chapter_id,
            Course.user_id == user_id
        )\
        .order_by(QuizAttempt.created_at.desc())\
        .all()


def get_all_attempts_by_user(db: Session, user_id: int):
    """Used for analytics tab — fetches all attempts across all chapters/courses."""

    return db.query(QuizAttempt)\
        .join(Chapter)\
        .join(Course)\
        .filter(Course.user_id == user_id)\
        .order_by(QuizAttempt.created_at.desc())\
        .all()


def delete_attempts_by_chapter(db: Session, chapter_id: int, user_id: int):

    chapter = db.query(Chapter)\
        .join(Course)\
        .filter(
            Chapter.id == chapter_id,
            Course.user_id == user_id
        )\
        .first()

    if not chapter:
        return None

    db.query(QuizAttempt)\
        .filter(QuizAttempt.chapter_id == chapter_id)\
        .delete()

    db.commit()
    return True