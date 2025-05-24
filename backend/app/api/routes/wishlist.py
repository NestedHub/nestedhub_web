from fastapi import Depends, HTTPException, status, APIRouter
from sqlmodel import Session
from typing import List
from app.models.models import User
from app.api.deps import require_customer, get_db_session
from app.crud.crud_wishlist import (
    add_property_to_wishlist,
    get_user_wishlist,
    remove_property_from_wishlist,
    clear_user_wishlist
)
from app.models.wishlist_schemas import WishListCreate, WishListResponse

router = APIRouter(prefix="/wishlist")

@router.post(
    "/",
    response_model=WishListResponse,
    status_code=status.HTTP_201_CREATED
)
def add_to_wishlist(
    wishlist_item: WishListCreate,
    session: Session = Depends(get_db_session),
    current_user: User = Depends(require_customer)
):
    """
    Add a property to the user's wishlist.
    """
    return add_property_to_wishlist(session, current_user.user_id, wishlist_item.property_id)

@router.get(
    "/",
    response_model=List[WishListResponse]
)
def get_wishlist(
    session: Session = Depends(get_db_session),
    current_user: User = Depends(require_customer)
):
    """
    Retrieve all properties in the user's wishlist.
    """
    return get_user_wishlist(session, current_user.user_id)

@router.delete(
    "/{property_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def remove_from_wishlist(
    property_id: int,
    session: Session = Depends(get_db_session),
    current_user: User = Depends(require_customer)
):
    """
    Remove a property from the user's wishlist.
    """
    remove_property_from_wishlist(session, current_user.user_id, property_id)
    return None

@router.delete(
    "/",
    status_code=status.HTTP_204_NO_CONTENT
)
def clear_wishlist(
    session: Session = Depends(get_db_session),
    current_user: User = Depends(require_customer)
):
    """
    Clear all properties from the user's wishlist.
    """
    clear_user_wishlist(session, current_user.user_id)
    return None
