from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import jwt
from passlib.context import CryptContext
from app.models.models import UserRole
from app.core.config import settings
import secrets

# Token Expiration Constants
ACCESS_TOKEN_EXPIRE_MINUTES = 120  # 30 minutes
REFRESH_TOKEN_EXPIRE_DAYS = 7     # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"

def create_access_token(
    *,
    user_id: int,
    email: str,
    role: UserRole,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token with user ID, email, and role.

    Args:
        user_id: The user's ID.
        email: The user's email address.
        role: The user's role.
        expires_delta: Optional expiration time delta (default: 30 minutes).

    Returns:
        Encoded JWT access token.
    """
    to_encode = {
        "sub": str(user_id),
        "email": email,
        "role": role.value,
        "iat": datetime.now(timezone.utc),
    }
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(
    *,
    user_id: int,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT refresh token with user ID.

    Args:
        user_id: The user's ID.
        expires_delta: Optional expiration time delta (default: 7 days).

    Returns:
        Encoded JWT refresh token.
    """
    to_encode = {
        "sub": str(user_id),
        "type": "refresh",
        "jti": secrets.token_hex(16),  # Unique token identifier
        "iat": datetime.now(timezone.utc),
    }
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(*, token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT access token.

    Args:
        token: The JWT token to decode.

    Returns:
        Dict containing the decoded payload (e.g., {"sub": "123", "role": "customer"}).

    Raises:
        jwt.ExpiredSignatureError: If the token has expired.
        jwt.InvalidTokenError: If the token is invalid.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        if "role" not in payload:
            raise jwt.InvalidTokenError("Role not found in token")
        if payload.get("type") == "refresh":
            raise jwt.InvalidTokenError("Refresh token cannot be used as access token")
        return payload
    except jwt.ExpiredSignatureError:
        raise
    except jwt.InvalidTokenError:
        raise

def decode_refresh_token(*, token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT refresh token.

    Args:
        token: The JWT refresh token to decode.

    Returns:
        Dict containing the decoded payload (e.g., {"sub": "123", "type": "refresh"}).

    Raises:
        jwt.ExpiredSignatureError: If the token has expired.
        jwt.InvalidTokenError: If the token is invalid.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise jwt.InvalidTokenError("Access token cannot be used as refresh token")
        return payload
    except jwt.ExpiredSignatureError:
        raise
    except jwt.InvalidTokenError:
        raise

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.

    Args:
        plain_password: The plain text password.
        hashed_password: The hashed password.

    Returns:
        True if the password matches, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Hash a plain text password.

    Args:
        password: The plain text password.

    Returns:
        The hashed password.
    """
    return pwd_context.hash(password)
