from app.models.chapter import Chapter
from app.models.course import Course  
from app.schemas.chapter_schema import CreateChapter
from sqlalchemy.sql import func

def create_chapter(db, chapter_data : CreateChapter):
    max_index = db.query(func.max(Chapter.order_index)).filter(Chapter.course_id == chapter_data.course_id).scalar()
    if max_index is None:
        new_index = 1
    else:
        new_index = max_index + 1
    chapter = Chapter(title = chapter_data.title, order_index = new_index, course_id = chapter_data.course_id )
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    return chapter

def get_chapters_by_course(db, course_id):
    chapters = db.query(Chapter).filter(Chapter.course_id == course_id).order_by(Chapter.order_index).all()
    return chapters

def get_chapter_by_id(db, course_id, chapter_id):
    chapter = db.query(Chapter).filter(Chapter.course_id == course_id, Chapter.id == chapter_id).first()
    if not chapter:
        return None
    return chapter

def update_chapter_title(db, course_id, chapter_id, new_title):
    chapter = get_chapter_by_id(db, course_id, chapter_id)
    if not chapter:
        return None
    chapter.title = new_title
    db.commit()
    db.refresh(chapter)
    return chapter

def delete_chapter(db, course_id, chapter_id):
    chapter = get_chapter_by_id(db, course_id, chapter_id)
    if not chapter:
        return None
    db.delete(chapter)
    db.commit()