from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List
from app.api.deps import get_db_session, get_current_user, require_owner_or_admin, require_customer
from app.models.viewing_schemas import (
    ViewingRequestCreate,
    ViewingRequestResponse,
    ViewingRequestUpdate
)
from app.crud.crud_viewing import (
    create_viewing_request,
    get_viewing_request,
    get_user_viewing_requests,
    get_user_upcoming_viewings_request,
    update_viewing_request,
    delete_viewing_request,
    accept_viewing_request,
    deny_viewing_request,
    get_property_viewing_requests,
    get_owner_viewing_requests,
    get_owner_upcoming_viewings_request
)
from app.models.models import User

router = APIRouter(prefix="/viewing-requests")


@router.post("/", response_model=ViewingRequestResponse)
def create_viewing(
    viewing_request: ViewingRequestCreate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_customer)
):
    return create_viewing_request(db, viewing_request, current_user.user_id)


@router.get("/", response_model=List[ViewingRequestResponse])
def get_user_viewings(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_customer)
):
    return get_user_viewing_requests(db, current_user.user_id)


@router.get("/upcoming", response_model=List[ViewingRequestResponse])
def get_user_upcoming_viewings(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_customer)
):
    return get_user_upcoming_viewings_request(db, current_user.user_id)


@router.patch("/{request_id}", response_model=ViewingRequestResponse)
def update_viewing(
    request_id: int,
    viewing_request_update: ViewingRequestUpdate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_customer)
):
    return update_viewing_request(db, request_id, viewing_request_update, current_user.user_id)


@router.delete("/{request_id}")
def delete_viewing(
    request_id: int,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_customer)
):
    delete_viewing_request(db, request_id, current_user.user_id)
    return {"message": "Viewing request deleted successfully"}


@router.post("/{request_id}/accept", response_model=ViewingRequestResponse)
def accept_viewing(
    request_id: int,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_owner_or_admin)
):
    return accept_viewing_request(db, request_id, current_user.user_id)


@router.post("/{request_id}/deny", response_model=ViewingRequestResponse)
def deny_viewing(
    request_id: int,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_owner_or_admin)
):
    return deny_viewing_request(db, request_id, current_user.user_id)


@router.get("/property/{property_id}", response_model=List[ViewingRequestResponse])
def get_property_viewings(
    property_id: int,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_owner_or_admin)
):
    return get_property_viewing_requests(db, property_id, current_user.user_id)


@router.get("/owner/requests", response_model=List[ViewingRequestResponse])
def get_owner_viewings(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_owner_or_admin)
):
    return get_owner_viewing_requests(db, current_user.user_id)


@router.get("/owner/upcoming", response_model=List[ViewingRequestResponse])
def get_owner_upcoming_viewings(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_owner_or_admin)
):
    return get_owner_upcoming_viewings_request(db, current_user.user_id)


@router.get("/{request_id}", response_model=ViewingRequestResponse)
def get_viewing(
    request_id: int,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_customer)
):
    viewing_request = get_viewing_request(db, request_id)
    if viewing_request.user_id != current_user.user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this request")
    return viewing_request
