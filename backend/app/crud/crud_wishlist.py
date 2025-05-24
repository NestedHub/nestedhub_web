from sqlmodel import Session, select
from fastapi import HTTPException, status
from app.models.models import WishList, Property
from datetime import datetime, timezone

def add_property_to_wishlist(session: Session, user_id: int, property_id: int) -> WishList:
    """
    Add a property to the user's wishlist.

    Args:
        session: Database session.
        user_id: ID of the user.
        property_id: ID of the property to add.

    Returns:
        The created wishlist item.

    Raises:
        HTTPException: If the property doesn't exist or is already in the wishlist.
    """
    # Check if property exists
    property = session.get(Property, property_id)
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check if already in wishlist
    existing_wishlist_item = session.exec(
        select(WishList)
        .where(WishList.user_id == user_id)
        .where(WishList.property_id == property_id)
    ).first()
    
    if existing_wishlist_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Property already in wishlist"
        )
    
    # Create new wishlist item
    wishlist_db = WishList(
        user_id=user_id,
        property_id=property_id,
        added_at=datetime.now(timezone.utc)
    )
    
    session.add(wishlist_db)
    session.commit()
    session.refresh(wishlist_db)
    
    return wishlist_db

def get_user_wishlist(session: Session, user_id: int) -> list[WishList]:
    """
    Retrieve all properties in the user's wishlist.

    Args:
        session: Database session.
        user_id: ID of the user.

    Returns:
        List of wishlist items.
    """
    wishlist_items = session.exec(
        select(WishList)
        .where(WishList.user_id == user_id)
    ).all()
    
    return wishlist_items

def remove_property_from_wishlist(session: Session, user_id: int, property_id: int) -> None:
    """
    Remove a property from the user's wishlist.

    Args:
        session: Database session.
        user_id: ID of the user.
        property_id: ID of the property to remove.

    Raises:
        HTTPException: If the wishlist item doesn't exist.
    """
    wishlist_item = session.exec(
        select(WishList)
        .where(WishList.user_id == user_id)
        .where(WishList.property_id == property_id)
    ).first()
    
    if not wishlist_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found"
        )
    
    session.delete(wishlist_item)
    session.commit()

def clear_user_wishlist(session: Session, user_id: int) -> None:
    """
    Clear all properties from the user's wishlist.

    Args:
        session: Database session.
        user_id: ID of the user.
    """
    wishlist_items = session.exec(
        select(WishList)
        .where(WishList.user_id == user_id)
    ).all()
    
    for item in wishlist_items:
        session.delete(item)
    
    session.commit()