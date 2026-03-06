from pydantic import BaseModel
from datetime import datetime

class CreateCourse(BaseModel):
    title : str
    description : str

class CourseResponse(BaseModel):
    id : int
    title : str
    description : str
    created_at : datetime
    
    class Config:
        from_attributes = True
        
class UpdateCourse(BaseModel):
    title : str
    description : str