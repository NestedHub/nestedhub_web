from fastapi import Depends, HTTPException, status, APIRouter
from sqlmodel import Session
from typing import List
from app.models.models import User
from app.api.deps import require_customer, require_owner_or_admin, get_current_user, get_db_session
from app.models.enums import UserRole, ReviewStatusEnum
from app.crud.crud_review import (
    create_review,
    get_user_reviews,
    get_property_reviews,
    approve_review,
    reject_review,
    delete_review
)
from app.models.review_schemas import ReviewCreate, ReviewResponse, ReviewStatusUpdate

router = APIRouter(prefix="/reviews")

@router.post(
    "/",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_review(
    review: ReviewCreate,
    session: Session = Depends(get_db_session),
    current_user: User = Depends(require_customer)
):
    """
    Create a new review for a property (defaults to pending).
    """
    return create_review(session, current_user.user_id, review)

@router.get(
    "/user",
    response_model=List[ReviewResponse],
)
def get_my_reviews(
    session: Session = Depends(get_db_session),
    current_user: User = Depends(require_customer)
):
    """
    Retrieve all reviews made by the current user.
    """
    return get_user_reviews(session, current_user.user_id)

@router.get(
    "/property/{property_id}",
    response_model=List[ReviewResponse],
)
def get_reviews_for_property(
    property_id: int,
    session: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve approved reviews for a property (all reviews for admins or property owners).
    """
    is_admin = current_user.role in [UserRole.admin, UserRole.property_owner]
    return get_property_reviews(session, property_id, include_all=is_admin)

@router.patch(
    "/{review_id}/status",
    response_model=ReviewResponse,
)
def update_review_status(
    review_id: int,
    status_update: ReviewStatusUpdate,
    session: Session = Depends(get_db_session),
    current_user: User = Depends(require_owner_or_admin)
):
    """
    Approve or reject a review (admin or property owner only).
    """
    if status_update.status == ReviewStatusEnum.approved:
        return approve_review(session, review_id)
    elif status_update.status == ReviewStatusEnum.rejected:
        return reject_review(session, review_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status"
        )

@router.delete(
    "/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_review(
    review_id: int,
    session: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a review (by the author or admin/property owner).
    """
    delete_review(session, review_id, current_user.user_id, current_user.role)
    return None