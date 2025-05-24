from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.enums import ViewingRequestStatusEnum

class ViewingRequestBase(BaseModel):
    property_id: int
    requested_time: datetime

class ViewingRequestCreate(ViewingRequestBase):
    pass

class ViewingRequestUpdate(BaseModel):
    requested_time: Optional[datetime] = None
    status: Optional[ViewingRequestStatusEnum] = None

class ViewingRequestResponse(ViewingRequestBase):
    request_id: int
    user_id: int
    status: ViewingRequestStatusEnum
    created_at: datetime

    class Config:
        from_attributes = True