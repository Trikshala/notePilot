from pydantic import BaseModel
from datetime import datetime

class CreateChapter(BaseModel):
    title : str
    order_index : int
    course_id : int

class ChapterResponse(BaseModel):
    id : int
    title : str
    order_index : int
    created_at : datetime
    course_id : int
    
    class Config:
        from_attributes = True
        
class UpdateChapter(BaseModel):
    new_title : str