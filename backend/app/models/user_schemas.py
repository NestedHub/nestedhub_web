from typing import Optional
from pydantic import BaseModel, EmailStr, validator
from app.models.enums import UserRole
from datetime import datetime
from pydantic import Field
from enum import Enum


class UserRole(str, Enum):
    customer = "customer"
    property_owner = "property_owner"
    admin = "admin"


class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole
    id_card_url: Optional[str] = None
    profile_picture_url: Optional[str] = None


class UserCreate(UserBase):
    password: Optional[str] = None

    @validator('password')
    def password_required_for_non_oauth(cls, v, values):
        if not v and values.get('oauth_provider', 'none') == 'none':
            raise ValueError('Password is required for non-OAuth users')
        return v


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    id_card_url: Optional[str] = None
    profile_picture_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_approved: Optional[bool] = None


class UserResponse(UserBase):
    user_id: int
    is_email_verified: bool
    is_approved: bool
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    email: EmailStr
    code: str
    new_password: str


class TokenRevoke(BaseModel):
    token: str


class UserCountResponse(BaseModel):
    total: int