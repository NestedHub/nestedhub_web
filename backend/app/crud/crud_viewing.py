from typing import Optional, List
from sqlmodel import Session, select
from app.models.models import ViewingRequest, User, Property
from app.models.viewing_schemas import ViewingRequestCreate, ViewingRequestUpdate
from app.models.enums import ViewingRequestStatusEnum
from fastapi import HTTPException
from datetime import datetime, timezone


def create_viewing_request(
    db: Session,
    viewing_request: ViewingRequestCreate,
    user_id: int
) -> ViewingRequest:
    # Verify property exists
    property = db.get(Property, viewing_request.property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")

    # Verify user exists
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Create viewing request
    db_viewing_request = ViewingRequest(
        user_id=user_id,
        property_id=viewing_request.property_id,
        requested_time=viewing_request.requested_time,
        status=ViewingRequestStatusEnum.pending,
        message=viewing_request.message  # <--- ADDED: Include the message
    )

    db.add(db_viewing_request)
    db.commit()
    db.refresh(db_viewing_request)
    return db_viewing_request


def get_viewing_request(db: Session, request_id: int) -> Optional[ViewingRequest]:
    viewing_request = db.get(ViewingRequest, request_id)
    if not viewing_request:
        raise HTTPException(
            status_code=404, detail="Viewing request not found")
    return viewing_request


def get_user_viewing_requests(db: Session, user_id: int) -> List[ViewingRequest]:
    statement = select(ViewingRequest).where(ViewingRequest.user_id == user_id)
    return db.exec(statement).all()


def get_user_upcoming_viewings_request(db: Session, user_id: int) -> List[ViewingRequest]:
    current_time = datetime.now(timezone.utc)
    statement = (
        select(ViewingRequest)
        .where(ViewingRequest.user_id == user_id)
        .where(ViewingRequest.requested_time > current_time)
        .where(ViewingRequest.status.in_([ViewingRequestStatusEnum.pending, ViewingRequestStatusEnum.accepted]))
    )
    return db.exec(statement).all()


def update_viewing_request(
    db: Session,
    request_id: int,
    viewing_request_update: ViewingRequestUpdate,
    user_id: int
) -> ViewingRequest:
    db_viewing_request = db.get(ViewingRequest, request_id)
    if not db_viewing_request:
        raise HTTPException(
            status_code=404, detail="Viewing request not found")

    # Verify user owns the request
    if db_viewing_request.user_id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this request")

    # This line already handles the message field because `viewing_request_update`
    # now includes `message: Optional[str]`. If `message` is present in the
    # update_data, it will be set. If it's not present (e.g., exclude_unset=True),
    # it won't attempt to change the existing message.
    # Changed .dict() to .model_dump() for Pydantic v2
    update_data = viewing_request_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_viewing_request, key, value)

    db.add(db_viewing_request)
    db.commit()
    db.refresh(db_viewing_request)
    return db_viewing_request


def delete_viewing_request(db: Session, request_id: int, user_id: int) -> None:
    db_viewing_request = db.get(ViewingRequest, request_id)
    if not db_viewing_request:
        raise HTTPException(
            status_code=404, detail="Viewing request not found")

    # Verify user owns the request
    if db_viewing_request.user_id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this request")

    db.delete(db_viewing_request)
    db.commit()


def accept_viewing_request(
    db: Session,
    request_id: int,
    user_id: int
) -> ViewingRequest:
    db_viewing_request = db.get(ViewingRequest, request_id)
    if not db_viewing_request:
        raise HTTPException(
            status_code=404, detail="Viewing request not found")

    # Verify user is property owner
    property = db.get(Property, db_viewing_request.property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")

    if property.user_id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to accept this request")

    # Update status to accepted
    db_viewing_request.status = ViewingRequestStatusEnum.accepted
    db.add(db_viewing_request)
    db.commit()
    db.refresh(db_viewing_request)
    return db_viewing_request


def deny_viewing_request(
    db: Session,
    request_id: int,
    user_id: int
) -> ViewingRequest:
    db_viewing_request = db.get(ViewingRequest, request_id)
    if not db_viewing_request:
        raise HTTPException(
            status_code=404, detail="Viewing request not found")

    # Verify user is property owner
    property = db.get(Property, db_viewing_request.property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")

    if property.user_id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to deny this request")

    # Update status to denied
    db_viewing_request.status = ViewingRequestStatusEnum.denied
    db.add(db_viewing_request)
    db.commit()
    db.refresh(db_viewing_request)
    return db_viewing_request


def get_property_viewing_requests(db: Session, property_id: int, user_id: int) -> List[ViewingRequest]:
    # Verify property exists
    property = db.get(Property, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")

    # Verify user is property owner
    if property.user_id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view requests for this property")

    statement = select(ViewingRequest).where(
        ViewingRequest.property_id == property_id)
    return db.exec(statement).all()


def get_owner_viewing_requests(db: Session, user_id: int) -> List[ViewingRequest]:
    # Return viewing requests for properties owned by the user
    statement = (
        select(ViewingRequest)
        .join(Property, ViewingRequest.property_id == Property.property_id)
        .where(Property.user_id == user_id)
    )
    return db.exec(statement).all()


def get_owner_upcoming_viewings_request(db: Session, user_id: int) -> List[ViewingRequest]:
    current_time = datetime.now(timezone.utc)
    statement = (
        select(ViewingRequest)
        .join(Property, ViewingRequest.property_id == Property.property_id)
        .where(Property.user_id == user_id)
        .where(ViewingRequest.requested_time > current_time)
        .where(ViewingRequest.status.in_([ViewingRequestStatusEnum.pending, ViewingRequestStatusEnum.accepted]))
    )
    return db.exec(statement).all()
