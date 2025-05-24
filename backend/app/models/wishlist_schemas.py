from pydantic import BaseModel
from datetime import datetime


class WishListCreate(BaseModel):
    property_id: int

class WishListResponse(BaseModel):
    user_id: int
    property_id: int
    added_at: datetime

    class Config:
        from_attributes = True