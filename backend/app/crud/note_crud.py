from app.models.note import Note
from app.models.chapter import Chapter
from app.models.course import Course

def create_or_replace_note(db, chapter_id, user_id, note_data):
    
    chapter = db.query(Chapter)\
        .join(Course)\
        .filter(
            Chapter.id == chapter_id,
            Course.user_id == user_id
        )\
        .first()
    
    if not chapter:
        return None

    existing_note = db.query(Note).filter(Note.chapter_id == chapter_id).first()
    
    if existing_note:
        db.delete(existing_note)
        db.commit()

    note = Note(
        chapter_id=chapter_id,
        content=note_data.content,
        style=note_data.style,
        length=note_data.length,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def get_note_by_chapter(db, chapter_id, user_id):
    
    return db.query(Note)\
        .join(Chapter)\
        .join(Course)\
        .filter(
            Note.chapter_id == chapter_id,
            Course.user_id == user_id
        )\
        .first()


def delete_note_by_chapter(db, chapter_id, user_id):
    
    chapter = db.query(Chapter)\
        .join(Course)\
        .filter(
            Chapter.id == chapter_id,
            Course.user_id == user_id
        )\
        .first()
    
    if not chapter:
        return None

    note = db.query(Note).filter(Note.chapter_id == chapter_id).first()
    if note:
        db.delete(note)
        db.commit()
        return note

    return False