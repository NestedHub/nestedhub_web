from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.enums import UserRole
from datetime import datetime
from pydantic import Field


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: Optional[str] = None
    role: UserRole
    id_card_url: Optional[str] = None
    profile_picture_url: Optional[str] = None  # Added

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_approved: Optional[bool] = None
    id_card_url: Optional[str] = None
    profile_picture_url: Optional[str] = None  # Added


class UserResponse(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    phone: Optional[str]
    role: UserRole
    id_card_url: Optional[str] = None  # Only visible to admins
    profile_picture_url: Optional[str] = None  # Added
    is_email_verified: bool
    is_approved: bool
    is_active: bool

    class Config:
        orm_mode = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: dict


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    email: EmailStr
    code: str
    new_password: str


class TokenRevoke(BaseModel):
    token: str
    expires_at: datetime
