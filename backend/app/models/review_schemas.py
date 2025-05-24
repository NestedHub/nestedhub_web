from pydantic import BaseModel, conint
from typing import Annotated
from datetime import datetime
from app.models.enums import ReviewStatusEnum

class ReviewCreate(BaseModel):
    property_id: int
    rating: Annotated[int, conint(ge=1, le=5)]  # Rating between 1 and 5
    comment: str | None = None

class ReviewResponse(BaseModel):
    review_id: int
    user_id: int
    property_id: int
    rating: int
    comment: str | None
    status: ReviewStatusEnum
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewStatusUpdate(BaseModel):
    status: ReviewStatusEnum  # Strictly "approved" or "rejected"