from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.enums import ViewingRequestStatusEnum

class ViewingRequestBase(BaseModel):
    property_id: int
    requested_time: datetime
    message: Optional[str] = None # Added message field

class ViewingRequestCreate(ViewingRequestBase):
    pass

class ViewingRequestUpdate(BaseModel):
    requested_time: Optional[datetime] = None
    status: Optional[ViewingRequestStatusEnum] = None
    message: Optional[str] = None # Added message field for updates

class ViewingRequestResponse(ViewingRequestBase):
    request_id: int
    user_id: int
    status: ViewingRequestStatusEnum
    created_at: datetime
    # No need to explicitly add message here again if it's in ViewingRequestBase
    # message: Optional[str] = None # This is already inherited from ViewingRequestBase

    class Config:
        from_attributes = True