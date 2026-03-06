from app.models.course import Course
from app.schemas.course_schema import CreateCourse

def create_course(db, user_id, course_data : CreateCourse):
    course = Course(title = course_data.title, description = course_data.description, user_id = user_id)
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


def get_courses_by_user(db, user_id):
    courses = db.query(Course).filter(Course.user_id == user_id).all()
    return courses

def get_course_by_id(db, course_id, user_id):
    course = db.query(Course).filter(Course.id == course_id, Course.user_id == user_id).first()
    if not course:
        return None
    return course

def update_course_details(db, course_id, user_id, update_data):
    course = get_course_by_id(db, course_id, user_id)
    if not course:
        return None
    course.title = update_data.title
    course.description = update_data.description
    db.commit()
    db.refresh(course)
    return course
    
def delete_course(db, course_id, user_id):
    course = get_course_by_id(db, course_id, user_id)
    if not course:
        return None
    db.delete(course)
    db.commit()