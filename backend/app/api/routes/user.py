from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import EmailStr
from sqlmodel import Session, select, func
from typing import Optional, List
from app.core.email import send_email  # Import the send_email function
from app.crud.crud_user import (
    create_db_user, authenticate_user, verify_email_code,
    request_password_reset, reset_password, revoke_token,
    get_user_by_id, update_user_in_db, authenticate_google_user,
    search_users, list_users, delete_user, get_user_count
)
from app.models.models import User, UserRole
from app.api.deps import get_db_session, get_current_user, require_admin, get_current_user_optional
from app.models.user_schemas import UserRole, UserCreate, UserResponse, TokenResponse, PasswordResetRequest, PasswordResetConfirm, TokenRevoke, UserUpdate, PublicUserResponse, UserCountResponse
from app.core.config import settings
import httpx
import urllib.parse

GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI = settings.GOOGLE_REDIRECT_URI
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

router = APIRouter(prefix="/users")


@router.get("/search", response_model=List[UserResponse])
def search_users_handler(
    name: Optional[str] = Query(
        None, description="Search by name (partial match)"),
    email: Optional[str] = Query(
        None, description="Search by email (partial match)"),
    phone: Optional[str] = Query(
        None, description="Search by phone (partial match)"),
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(
        None, description="Filter by active status"),
    is_approved: Optional[bool] = Query(
        None, description="Filter by approval status"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(10, ge=1, le=100, description="Pagination limit"),
    session: Session = Depends(get_db_session),
    current_user: User = Depends(require_admin)
):
    """
    Search for users by name, email, phone, role, or status. Restricted to admins.
    Supports pagination.
    """
    users = search_users(
        session=session,
        name=name,
        email=email,
        phone=phone,
        role=role,
        is_active=is_active,
        is_approved=is_approved,
        skip=skip,
        limit=limit
    )

    return [UserResponse(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        id_card_url=user.id_card_url,
        profile_picture_url=user.profile_picture_url,
        is_email_verified=user.is_email_verified,
        is_approved=user.is_approved,
        is_active=user.is_active
    ) for user in users]


@router.get("/google/login")
async def google_login():
    """
    Redirect to Google's OAuth2 authorization URL.
    """
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    auth_url = f"{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}"
    return {"auth_url": auth_url}


@router.get("/google/callback", response_model=TokenResponse)
async def google_callback(
    code: str,
    session: Session = Depends(get_db_session)
):
    """
    Handle Google OAuth2 callback, exchange code for tokens, and authenticate user.
    """
    async with httpx.AsyncClient() as client:
        # Exchange code for access token
        token_response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code"
            }
        )
        if token_response.status_code != 200:
            raise HTTPException(
                status_code=400, detail="Failed to exchange code for token")

        token_data = token_response.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(
                status_code=400, detail="No access token received")

        # Fetch user info
        user_response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if user_response.status_code != 200:
            raise HTTPException(
                status_code=400, detail="Failed to fetch user info")

        user_info = user_response.json()
        email = user_info.get("email")
        name = user_info.get("name", "Google User")
        google_id = user_info.get("sub")  # Google's unique user ID
        picture = user_info.get("picture")

        if not email or not google_id:
            raise HTTPException(
                status_code=400, detail="Invalid user info from Google")

        # Authenticate or create user
        tokens = authenticate_google_user(
            session=session,
            email=email,
            google_id=google_id,
            name=name,
            profile_picture_url=picture
        )
        return TokenResponse(**tokens)


@router.post("/register", response_model=UserResponse)
def register_user(
    user: UserCreate,
    session: Session = Depends(get_db_session),
    # current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Register a new user and send verification email if password is provided.
    Accessible to unauthenticated users for customer or property owner roles.
    Customers are auto-approved; property owners require admin approval.
    """
    db_user = create_db_user(
        session=session,
        name=user.name,
        email=user.email,
        phone=user.phone,
        password=user.password,
        role=user.role,
        id_card_url=user.id_card_url,
        profile_picture_url=user.profile_picture_url  # Added
        # current_user=current_user
    )
    return UserResponse(
        user_id=db_user.user_id,
        name=db_user.name,
        email=db_user.email,
        phone=db_user.phone,
        role=db_user.role,
        # id_card_url=db_user.id_card_url if current_user and current_user.role == UserRole.admin else None,
        profile_picture_url=db_user.profile_picture_url,
        is_email_verified=db_user.is_email_verified,
        is_approved=db_user.is_approved,
        is_active=db_user.is_active
    )


@router.post("/login", response_model=TokenResponse)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_db_session)
):
    """
    Authenticate user and return access and refresh tokens.
    """
    tokens = authenticate_user(
        session=session,
        email=form_data.username,
        password=form_data.password
    )
    return TokenResponse(**tokens)


@router.post("/verify-email", response_model=TokenResponse)
def verify_email(
    email: EmailStr,
    code: str,
    session: Session = Depends(get_db_session)
):
    """
    Verify email with code and return tokens.
    """
    tokens = verify_email_code(session=session, email=email, code=code)
    return TokenResponse(**tokens)


@router.post("/password-reset-request")
def request_reset_password(
    reset_request: PasswordResetRequest,
    session: Session = Depends(get_db_session)
):
    """
    Request a password reset code.
    """
    request_password_reset(session=session, email=reset_request.email)
    return {"message": "Password reset code sent to email"}


@router.post("/password-reset")
def confirm_reset_password(
    reset_data: PasswordResetConfirm,
    session: Session = Depends(get_db_session)
):
    """
    Reset password using verification code.
    """
    success = reset_password(
        session=session,
        email=reset_data.email,
        code=reset_data.code,
        new_password=reset_data.new_password
    )
    if success:
        return {"message": "Password reset successfully"}
    raise HTTPException(status_code=400, detail="Password reset failed")


@router.post("/token/revoke")
def revoke_user_token(
    revoke_data: TokenRevoke,
    session: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Revoke a JWT token.
    """
    revoke_token(
        session=session,
        token=revoke_data.token,
        expires_at=revoke_data.expires_at
    )
    return {"message": "Token revoked successfully"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get information about the currently authenticated user.
    """
    return UserResponse(
        user_id=current_user.user_id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        role=current_user.role,
        id_card_url=None,
        profile_picture_url=current_user.profile_picture_url,  # Added
        is_email_verified=current_user.is_email_verified,
        is_approved=current_user.is_approved,
        is_active=current_user.is_active
    )


@router.get("/count", response_model=UserCountResponse)
def get_user_count_handler(
    name: Optional[str] = Query(
        None, description="Search by name (partial match)"),
    email: Optional[str] = Query(
        None, description="Search by email (partial match)"),
    phone: Optional[str] = Query(
        None, description="Search by phone (partial match)"),
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(
        None, description="Filter by active status"),
    is_approved: Optional[bool] = Query(
        None, description="Filter by approval status"),
    session: Session = Depends(get_db_session),
    current_user: User = Depends(require_admin)
):
    """
    Get total count of users with filters. Restricted to admins.
    """
    total = get_user_count(
        session=session,
        name=name,
        email=email,
        phone=phone,
        role=role,
        is_active=is_active,
        is_approved=is_approved
    )
    return UserCountResponse(total=total)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    session: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Admins can see id_card_url for property owners.
    """
    # if current_user.role != UserRole.admin and current_user.user_id != user_id:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Not authorized to access this user's information"
    #     )
    user = get_user_by_id(session=session, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        id_card_url=user.id_card_url if current_user.role == UserRole.admin else None,
        profile_picture_url=user.profile_picture_url,  # Added
        is_email_verified=user.is_email_verified,
        is_approved=user.is_approved,
        is_active=user.is_active
    )

@router.get("/public/{user_id}", response_model=PublicUserResponse)
def get_public_user(
    user_id: int,
    session: Session = Depends(get_db_session)
):
    user = get_user_by_id(session=session, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return PublicUserResponse.from_orm(user)



@router.patch("/{user_id}/approve", response_model=UserResponse)
def approve_user(
    user_id: int,
    session: Session = Depends(get_db_session),
    current_user: User = Depends(require_admin)
):
    """
    Approve a property owner's account. Restricted to admins.
    Requires a valid id_card_url to be present.
    Sends a confirmation email to the user upon approval.
    """
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=403,
            detail="Only admins can approve users"
        )

    user = get_user_by_id(session=session, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role != UserRole.property_owner:
        raise HTTPException(
            status_code=400, detail="Only property owners need approval")

    if user.is_approved:
        raise HTTPException(status_code=400, detail="User already approved")

    if not user.id_card_url:
        raise HTTPException(
            status_code=400,
            detail="Cannot approve user without an ID card URL"
        )

    user.is_approved = True
    session.add(user)
    session.commit()
    session.refresh(user)

    try:
        send_email(
            recipient=user.email,
            subject="Property Owner Account Approved",
            body="Your property owner account has been approved. You can now list properties."
        )
    except HTTPException as e:
        print(f"Failed to send approval email: {str(e)}")

    return UserResponse(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        id_card_url=user.id_card_url,
        profile_picture_url=user.profile_picture_url,  # Added
        is_email_verified=user.is_email_verified,
        is_approved=user.is_approved,
        is_active=user.is_active
    )


@router.delete("/{user_id}/reject")
def reject_property_owner(
    user_id: int,
    session: Session = Depends(get_db_session),
    current_user: User = Depends(require_admin)
):
    """
    Reject a property owner's account. Restricted to admins.
    """
    user = get_user_by_id(session=session, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != UserRole.property_owner:
        raise HTTPException(
            status_code=400, detail="Only property owners can be rejected")
    if user.is_approved:
        raise HTTPException(
            status_code=400, detail="Approved users cannot be rejected")

    session.delete(user)
    session.commit()
    return {"message": "User rejected"}


@router.get("/pending-approvals", response_model=List[UserResponse])
def get_pending_approvals(
    session: Session = Depends(get_db_session),
    current_user: User = Depends(require_admin)
):
    """
    Get a list of property owners awaiting approval. Restricted to admins.
    Includes id_card_url for review.
    """
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=403,
            detail="Only admins can view pending approvals"
        )
    users = session.exec(
        select(User).where(User.role == UserRole.property_owner,
                           User.is_approved == False)
    ).all()
    return [UserResponse(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        id_card_url=user.id_card_url,
        profile_picture_url=user.profile_picture_url,  # Added
        is_email_verified=user.is_email_verified,
        is_approved=user.is_approved,
        is_active=user.is_active
    ) for user in users]


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    session: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Update user information.
    Users can only update their own basic info unless they're an admin.
    Admins can update id_card_url for property owners.
    """
    db_user = get_user_by_id(session=session, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if db_user.user_id != current_user.user_id and current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this user"
        )

    updated_user = update_user_in_db(
        session=session,
        db_user=db_user,
        user_data=user_update,
        current_user=current_user
    )

    return UserResponse(
        user_id=updated_user.user_id,
        name=updated_user.name,
        email=updated_user.email,
        phone=updated_user.phone,
        role=updated_user.role,
        id_card_url=updated_user.id_card_url if current_user.role == UserRole.admin else None,
        profile_picture_url=updated_user.profile_picture_url,  # Added
        is_email_verified=updated_user.is_email_verified,
        is_approved=updated_user.is_approved,
        is_active=updated_user.is_active
    )


@router.get("/", response_model=List[UserResponse])
def list_users_handler(
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(10, ge=1, le=100, description="Pagination limit"),
    session: Session = Depends(get_db_session),
    current_user: User = Depends(require_admin)
):
    """
    List all users with pagination. Restricted to admins.
    """
    users = list_users(session=session, skip=skip, limit=limit)
    return [UserResponse(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        id_card_url=user.id_card_url,
        profile_picture_url=user.profile_picture_url,
        is_email_verified=user.is_email_verified,
        is_approved=user.is_approved,
        is_active=user.is_active
    ) for user in users]


@router.delete("/{user_id}")
def delete_user_handler(
    user_id: int,
    hard_delete: bool = Query(
        False, description="Set to true for permanent deletion"),
    session: Session = Depends(get_db_session),
    current_user: User = Depends(require_admin)
):
    """
    Delete a user (soft delete by default, or hard delete if specified).
    - Soft delete: Sets is_active=False.
    - Hard delete: Removes user from database.
    Restricted to admins.
    """
    if user_id == current_user.user_id:
        raise HTTPException(
            status_code=400, detail="Admins cannot delete themselves")

    delete_user(session=session, user_id=user_id, hard_delete=hard_delete)
    return {"message": f"User {'permanently deleted' if hard_delete else 'deactivated'}"}


@router.patch("/{user_id}/ban", response_model=UserResponse)
def ban_user(
    user_id: int,
    ban: bool = Query(True, description="True to ban, False to unban"),
    session: Session = Depends(get_db_session),
    current_user: User = Depends(require_admin)
):
    """
    Ban or unban a user by setting their is_active status.
    - ban=True: Deactivates the user (bans them).
    - ban=False: Reactivates the user (unbans them).
    Restricted to admins.
    """
    if user_id == current_user.user_id:
        raise HTTPException(
            status_code=400, detail="Admins cannot ban themselves")

    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not ban
    session.add(user)
    session.commit()
    session.refresh(user)

    return UserResponse(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        id_card_url=user.id_card_url,
        profile_picture_url=user.profile_picture_url,
        is_email_verified=user.is_email_verified,
        is_approved=user.is_approved,
        is_active=user.is_active
    )
