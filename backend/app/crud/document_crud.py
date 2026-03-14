from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.chapter import Chapter
from app.models.course import Course


def create_document(db, chapter_id, user_id, document_data, raw_text):

    chapter = db.query(Chapter)\
        .join(Course)\
        .filter(
            Chapter.id == chapter_id,
            Course.user_id == user_id
        )\
        .first()

    if not chapter:
        raise Exception("Chapter not found or unauthorized")

    document = Document(
        chapter_id=chapter_id,
        file_name=document_data.file_name,
        source_type=document_data.source_type,
        file_path=document_data.file_path,
        raw_text=raw_text
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


def get_documents_by_chapter(db, chapter_id, user_id):

    return db.query(Document)\
        .join(Chapter)\
        .join(Course)\
        .filter(
            Document.chapter_id == chapter_id,
            Course.user_id == user_id
        )\
        .all()


def delete_document(db, document_id, user_id):

    document = db.query(Document)\
        .join(Chapter)\
        .join(Course)\
        .filter(
            Document.id == document_id,
            Course.user_id == user_id
        )\
        .first()

    if not document:
        return None

    db.delete(document)
    db.commit()
    
    return document


def delete_documents_by_chapter(db, chapter_id, user_id):

    chapter = db.query(Chapter)\
        .join(Course)\
        .filter(
            Chapter.id == chapter_id,
            Course.user_id == user_id
        )\
        .first()

    if not chapter:
        return None

    db.query(Document)\
        .filter(Document.chapter_id == chapter_id)\
        .delete()

    db.commit()
    
    return True
