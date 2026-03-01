from app.models.chapter import Chapter
from app.models.course import Course
from sqlalchemy.sql import func


def create_chapter(db, user_id, chapter_data):
    course = db.query(Course).filter(
        Course.id == chapter_data.course_id,
        Course.user_id == user_id
    ).first()

    if not course:
        return None

    max_index = db.query(func.max(Chapter.order_index))\
        .filter(Chapter.course_id == chapter_data.course_id)\
        .scalar()

    new_index = 1 if max_index is None else max_index + 1

    chapter = Chapter(
        title=chapter_data.title,
        order_index=new_index,
        course_id=chapter_data.course_id
    )

    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    return chapter


def get_chapters_by_course(db, course_id, user_id):
    return db.query(Chapter)\
        .join(Course)\
        .filter(
            Chapter.course_id == course_id,
            Course.user_id == user_id
        )\
        .order_by(Chapter.order_index)\
        .all()


def get_chapter_by_id(db, course_id, chapter_id, user_id):
    return db.query(Chapter)\
        .join(Course)\
        .filter(
            Chapter.id == chapter_id,
            Chapter.course_id == course_id,
            Course.user_id == user_id
        )\
        .first()


def update_chapter_title(db, course_id, chapter_id, user_id, new_title):
    chapter = get_chapter_by_id(db, course_id, chapter_id, user_id)

    if not chapter:
        return None

    chapter.title = new_title
    db.commit()
    db.refresh(chapter)
    return chapter


def delete_chapter(db, course_id, chapter_id, user_id):
    chapter = get_chapter_by_id(db, course_id, chapter_id, user_id)

    if not chapter:
        return None

    db.delete(chapter)
    db.commit()