from pydantic import BaseModel
from datetime import datetime

class NoteBase(BaseModel):
    style: str
    length: str


class NoteCreate(NoteBase):
    chapter_id: int
    content : str
    

class NoteResponse(NoteBase):
    id: int
    chapter_id: int
    content: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True