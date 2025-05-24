from sqlmodel import Session, select
from fastapi import HTTPException, status
from app.models.models import Review, Property, UserRole
from app.models.enums import ReviewStatusEnum
from app.models.review_schemas import ReviewCreate
from datetime import datetime, timezone
from decimal import Decimal

# Bayesian average parameters
SYSTEM_AVERAGE_RATING = Decimal("3.0")  # C: Mean rating across all properties
MINIMUM_VOTES = 5  # m: Minimum number of reviews to stabilize rating

def update_property_rating(session: Session, property_id: int) -> None:
    """
    Update the Bayesian average rating for a property based on approved reviews.

    Args:
        session: Database session.
        property_id: ID of the property to update.
    """
    # Get all approved reviews for the property
    approved_reviews = session.exec(
        select(Review)
        .where(Review.property_id == property_id)
        .where(Review.status == ReviewStatusEnum.approved)
    ).all()
    
    property = session.get(Property, property_id)
    if not property:
        return  # Property doesn't exist, no update needed

    if not approved_reviews:
        property.rating = None  # No approved reviews, clear rating
        session.commit()
        return

    # Calculate average rating (R) and number of votes (v)
    total_rating = sum(review.rating for review in approved_reviews)
    num_votes = len(approved_reviews)
    average_rating = Decimal(total_rating) / num_votes

    # Bayesian average: (R * v + C * m) / (v + m)
    weighted_rating = (average_rating * num_votes + SYSTEM_AVERAGE_RATING * MINIMUM_VOTES) / (num_votes + MINIMUM_VOTES)
    
    # Round to 2 decimal places to match Numeric(2, 2)
    property.rating = weighted_rating.quantize(Decimal("0.01"))
    
    session.commit()

def create_review(session: Session, user_id: int, review: ReviewCreate) -> Review:
    """
    Create a new review for a property.

    Args:
        session: Database session.
        user_id: ID of the user creating the review.
        review: Review data including property_id, rating, and optional comment.

    Returns:
        The created review.

    Raises:
        HTTPException: If the property doesn't exist or review already exists.
    """
    # Check if property exists
    property = session.get(Property, review.property_id)
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check if user already reviewed this property
    existing_review = session.exec(
        select(Review)
        .where(Review.user_id == user_id)
        .where(Review.property_id == review.property_id)
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this property"
        )
    
    # Create new review
    review_db = Review(
        user_id=user_id,
        property_id=review.property_id,
        rating=review.rating,
        comment=review.comment,
        status=ReviewStatusEnum.pending,
        created_at=datetime.now(timezone.utc)
    )
    
    session.add(review_db)
    session.commit()
    session.refresh(review_db)
    
    # No need to update rating here since the review is pending
    return review_db

def get_user_reviews(session: Session, user_id: int) -> list[Review]:
    """
    Retrieve all reviews made by a user.

    Args:
        session: Database session.
        user_id: ID of the user.

    Returns:
        List of reviews.
    """
    reviews = session.exec(
        select(Review)
        .where(Review.user_id == user_id)
    ).all()
    
    return reviews

def get_property_reviews(session: Session, property_id: int, include_all: bool = False) -> list[Review]:
    """
    Retrieve reviews for a property.

    Args:
        session: Database session.
        property_id: ID of the property.
        include_all: If True, return all reviews (for admins); otherwise, only approved reviews.

    Returns:
        List of reviews.

    Raises:
        HTTPException: If the property doesn't exist.
    """
    property = session.get(Property, property_id)
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    query = select(Review).where(Review.property_id == property_id)
    if not include_all:
        query = query.where(Review.status == ReviewStatusEnum.approved)
    
    reviews = session.exec(query).all()
    return reviews

def approve_review(session: Session, review_id: int) -> Review:
    """
    Approve a review and update property rating.

    Args:
        session: Database session.
        review_id: ID of the review.

    Returns:
        The updated review.

    Raises:
        HTTPException: If the review doesn't exist or is already approved/rejected.
    """
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    if review.status != ReviewStatusEnum.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Review is already {review.status}"
        )
    
    review.status = ReviewStatusEnum.approved
    session.commit()
    session.refresh(review)
    
    # Update property rating since the review is now approved
    update_property_rating(session, review.property_id)
    
    return review

def reject_review(session: Session, review_id: int) -> Review:
    """
    Reject a review and update property rating.

    Args:
        session: Database session.
        review_id: ID of the review.

    Returns:
        The updated review.

    Raises:
        HTTPException: If the review doesn't exist or is already approved/rejected.
    """
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    if review.status != ReviewStatusEnum.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Review is already {review.status}"
        )
    
    review.status = ReviewStatusEnum.rejected
    session.commit()
    session.refresh(review)
    
    # Update property rating to ensure it reflects only approved reviews
    update_property_rating(session, review.property_id)
    
    return review

def delete_review(session: Session, review_id: int, user_id: int, user_role: UserRole) -> None:
    """
    Delete a review and update property rating.

    Args:
        session: Database session.
        review_id: ID of the review.
        user_id: ID of the user requesting deletion.
        user_role: Role of the user.

    Raises:
        HTTPException: If the review doesn't exist or user lacks permission.
    """
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Only the review author or admin/property owner can delete
    if review.user_id != user_id and user_role not in [UserRole.admin, UserRole.property_owner]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this review"
        )
    
    property_id = review.property_id
    session.delete(review)
    session.commit()
    
    # Update property rating since a review was removed
    update_property_rating(session, property_id)