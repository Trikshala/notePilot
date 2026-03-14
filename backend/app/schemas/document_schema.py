from pydantic import BaseModel
from datetime import datetime

class DocumentBase(BaseModel):
    file_name: str
    source_type: str
    file_path : str


class DocumentResponse(DocumentBase):
    id: int
    chapter_id: int
    created_at: datetime

    class Config:
        from_attributes = True