import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.document_schema import DocumentResponse, DocumentBase
from app.crud.document_crud import create_document, get_documents_by_chapter, delete_document, delete_documents_by_chapter
from app.routers.user_routes import get_current_user
from app.services.text_extractor import extract_text_from_pdf, extract_text_from_txt

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

UPLOAD_DIR = "uploaded_docs"
MAX_PDF_SIZE = 10 * 1024 * 1024
MAX_DOCS_PER_CHAPTER = 2

ALLOWED_EXTENSIONS = {"pdf", "txt"}
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/{chapter_id}", response_model=DocumentResponse)
def upload_document(chapter_id: int, file: UploadFile = File(...), current_user=Depends(get_current_user), db: Session = Depends(get_db)):

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file."
        )
    
    ext = file.filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF and TXT files are allowed")

   
    existing_docs = get_documents_by_chapter(db, chapter_id, current_user.id)
    if len(existing_docs) >= MAX_DOCS_PER_CHAPTER:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Max {MAX_DOCS_PER_CHAPTER} documents already uploaded")

   
    if any(doc.file_name == file.filename for doc in existing_docs):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This file has already been uploaded")

 
    file_bytes = file.file.read()
    if len(file_bytes) > MAX_PDF_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"File size exceeds {MAX_PDF_SIZE / (1024*1024)} MB")
     

    if ext == "pdf":
        raw_text = extract_text_from_pdf(file_bytes)
    elif ext == "txt":
        raw_text = extract_text_from_txt(file_bytes)
    else:
        raw_text = ""

    if not raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded document contains no readable text"
        )

   
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    document_data = DocumentBase(file_name=file.filename, source_type=ext, file_path = file_path)
    try:
        document = create_document(db, chapter_id, current_user.id, document_data, raw_text)
    except Exception as e:
        try:
            os.remove(file_path)
        except Exception:
            pass
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return DocumentResponse.model_validate(document)


@router.get("/{chapter_id}", response_model=List[DocumentResponse])
def list_documents(chapter_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    documents = get_documents_by_chapter(db, chapter_id, current_user.id)
    return [DocumentResponse.model_validate(doc) for doc in documents]


@router.delete("/{document_id}")
def delete_document_route(document_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    document = delete_document(db, document_id, current_user.id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if document.file_path and os.path.exists(document.file_path):
        try:
            os.remove(document.file_path)
        except Exception:
            pass

    return JSONResponse(content={"detail": "Document deleted successfully"})


@router.delete("/chapter/{chapter_id}")
def delete_all_documents(chapter_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db), delete_notes: bool = False):
    from app.crud.note_crud import delete_note_by_chapter

    documents = get_documents_by_chapter(db, chapter_id, current_user.id)
    if not documents:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found or no documents to delete")

    for doc in documents:
        if doc.file_path and os.path.exists(doc.file_path):
            try:
                os.remove(doc.file_path)
            except Exception:
                pass

    delete_documents_by_chapter(db, chapter_id, current_user.id)

    if delete_notes:
        delete_note_by_chapter(db, chapter_id, current_user.id)

    return JSONResponse(content={"detail": "Documents deleted successfully"})