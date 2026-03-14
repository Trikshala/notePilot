from fastapi import APIRouter, Depends, HTTPException, status, Response
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.schemas.chapter_schema import ChapterResponse, CreateChapter, UpdateChapter
from app.crud.chapter_crud import create_chapter, get_chapters_by_course, get_chapter_by_id, update_chapter_title, delete_chapter
from app.routers.user_routes import get_current_user

router = APIRouter(
    prefix="/chapters",
    tags = ["Chapters"]
)

@router.post("/", response_model=ChapterResponse)
def create_new_chapter(chapter_data : CreateChapter, current_user = Depends(get_current_user), db : Session = Depends(get_db)):
    chapter = create_chapter(db, current_user.id, chapter_data)
    return ChapterResponse.model_validate(chapter)

@router.get("/{course_id}", response_model=list[ChapterResponse])
def list_chapters(course_id : int, current_user = Depends(get_current_user), db : Session = Depends(get_db)):
    chapters = get_chapters_by_course(db, course_id, current_user.id)
    return [ChapterResponse.model_validate(chapter) for chapter in chapters]

@router.get("/{course_id}/{chapter_id}", response_model=ChapterResponse)
def get_chapter(course_id : int, chapter_id : int, current_user = Depends(get_current_user), db : Session = Depends(get_db)):
    chapter = get_chapter_by_id(db, course_id, chapter_id, current_user.id)
    
    if not chapter:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail="Chapter Not Found"
        )
        
    return ChapterResponse.model_validate(chapter)

@router.patch("/{course_id}/{chapter_id}", response_model=ChapterResponse)
def update_chapter(course_id : int, chapter_id : int, update_data : UpdateChapter, current_user = Depends(get_current_user), db : Session = Depends(get_db)):
    chapter = update_chapter_title(db, course_id, chapter_id, current_user.id, new_title=update_data.new_title)
    
    if not chapter:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail="Chapter Not Found"
        )
         
    return ChapterResponse.model_validate(chapter)

@router.delete("/{course_id}/{chapter_id}")
def delete_chapter_route(course_id : int, chapter_id : int,current_user = Depends(get_current_user), db : Session = Depends(get_db)):
    chapter = get_chapter_by_id(db, course_id, chapter_id, current_user.id)
    
    if not chapter:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail="Chapter Not Found"
        )
    delete_chapter(db, course_id, chapter_id, current_user.id)
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)
