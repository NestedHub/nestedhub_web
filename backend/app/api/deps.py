from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from sqlmodel import Session
from app.core.db import sync_engine
from typing import Optional
from app.core.security import decode_access_token
from app.models.models import User, UserRole
from app.crud.crud_user import get_user_by_id, is_token_revoked
import jwt


def get_db_session():
    """
    Create and yield a synchronous database session.
    This function ensures that sessions are properly managed (e.g., committed or rolled back).
    """
    with Session(sync_engine) as session:
        try:
            yield session
        except Exception as e:
            # Rollback in case of an exception
            session.rollback()
            raise e
        finally:
            # Ensure the session is closed
            session.close()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/users/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_db_session)
) -> User:
    """
    Get the current user from a JWT access token.

    Args:
        token: The JWT access token.
        session: SQLModel database session.

    Returns:
        The User object.

    Raises:
        HTTPException: If the token is invalid, revoked, expired, or user not found.
    """
    try:
        payload = decode_access_token(token=token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if is_token_revoked(session=session, token=token):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user = get_user_by_id(session=session, user_id=int(user_id))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    session: Session = Depends(get_db_session)
) -> Optional[User]:
    """
    Get the current user from a JWT access token if available.
    Returns None if the token is missing or invalid.

    Args:
        token: The JWT access token (optional).
        session: SQLModel database session.

    Returns:
        The User object or None.
    """
    if not token:
        return None
    try:
        payload = decode_access_token(token=token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        if is_token_revoked(session=session, token=token):
            return None
        user = get_user_by_id(session=session, user_id=int(user_id))
        if not user or not user.is_active:
            return None
        return user
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def require_owner_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Ensure the current user is an approved property owner or admin.

    Args:
        current_user: The authenticated user.

    Returns:
        The User object.

    Raises:
        HTTPException: If the user is not a property owner or admin, or if a property owner is not approved.
    """
    if current_user.role not in [UserRole.property_owner, UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only property owners or admins can perform this action",
        )
    if current_user.role == UserRole.property_owner and not current_user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Property owner account not approved",
        )
    return current_user


def require_customer(current_user: User = Depends(get_current_user)) -> User:
    """
    Ensure the current user is a customer.

    Args:
        current_user: The authenticated user.

    Returns:
        The User object.

    Raises:
        HTTPException: If the user is not a customer.
    """
    if current_user.role != UserRole.customer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can perform this action",
        )
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Ensure the current user is an admin.
    """
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can perform this action",
        )
    return current_user
