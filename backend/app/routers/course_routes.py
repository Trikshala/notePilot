from fastapi import APIRouter, Depends, HTTPException, status
from fastapi import Response
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.schemas.course_schema import CourseResponse, CreateCourse, UpdateCourse
from app.crud.course_crud import create_course, get_courses_by_user, get_course_by_id, update_course_title, delete_course
from app.routers.user_routes import get_current_user

router = APIRouter(
    prefix="/courses",
    tags=["Courses"]
)

@router.post("/", response_model=CourseResponse)
def create_new_course(course_data: CreateCourse, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    course = create_course(db, current_user.id, course_data)
    return CourseResponse.model_validate(course)

@router.get("/", response_model=list[CourseResponse])
def list_courses(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    courses = get_courses_by_user(db, current_user.id)
    return [CourseResponse.model_validate(course) for course in courses]

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id : int, current_user = Depends(get_current_user), db : Session = Depends(get_db)):
    course = get_course_by_id(db, course_id, current_user.id)
    
    if not course:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail="Course Not Found"
        )
    return CourseResponse.model_validate(course)

@router.patch("/{course_id}", response_model=CourseResponse)
def update_course(course_id : int, update_data : UpdateCourse, current_user = Depends(get_current_user), db : Session = Depends(get_db)):
    course = update_course_title(db, course_id, current_user.id, update_data.new_title)
    if not course:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail="Course Not Found"
        )
    return CourseResponse.model_validate(course)

@router.delete("/{course_id}")
def delete_course_route(course_id : int, current_user = Depends(get_current_user), db : Session = Depends(get_db)):
    course = get_course_by_id(db, course_id, current_user.id)
    
    if not course:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail="Course Not Found"
        )
        
    delete_course(db, course_id, current_user.id)
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)