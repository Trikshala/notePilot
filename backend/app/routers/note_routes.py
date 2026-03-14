from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import concurrent.futures

from app.db.session import get_db
from app.schemas.note_schema import NoteBase, NoteCreate, NoteResponse
from app.crud.note_crud import create_or_replace_note, get_note_by_chapter, delete_note_by_chapter
from app.routers.user_routes import get_current_user
from app.crud.document_crud import get_documents_by_chapter
from app.services.notes_generator import generate_notes

router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)

VALID_STYLES = {"bullet", "paragraph", "structured"}
VALID_LENGTHS = {"short", "medium", "long"}

@router.post("/{chapter_id}", response_model=NoteResponse)
def create_notes(
    note_data: NoteBase,
    chapter_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if note_data.style not in VALID_STYLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid note style."
        )

    if note_data.length not in VALID_LENGTHS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid note length."
        )

    documents = get_documents_by_chapter(db, chapter_id, current_user.id)

    if not documents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No documents uploaded to generate notes."
        )

    try:
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(
                generate_notes,
                documents,
                note_data.style,
                note_data.length
            )

            content = future.result(timeout=90)  

    except concurrent.futures.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Note generation took too long. Try shorter documents."
        )

    except Exception as e:
        print("NOTE GENERATION ERROR:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error occurred while generating notes."
        )
    
    note_create = NoteCreate(
        chapter_id=chapter_id,
        style=note_data.style,
        length=note_data.length,
        content=content
    )

    note = create_or_replace_note(
        db,
        chapter_id,
        current_user.id,
        note_create
    )

    return NoteResponse.model_validate(note)


@router.get("/{chapter_id}", response_model=NoteResponse)
def get_notes(
    chapter_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    note = get_note_by_chapter(db, chapter_id, current_user.id)

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notes Not Found"
        )

    return NoteResponse.model_validate(note)


@router.delete("/{chapter_id}")
def delete_note(
    chapter_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    note = get_note_by_chapter(db, chapter_id, current_user.id)

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notes Not Found"
        )

    delete_note_by_chapter(db, chapter_id, current_user.id)

    return JSONResponse(content={"detail": "Notes deleted successfully"})