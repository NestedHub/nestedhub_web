from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, List
import secrets
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlmodel import Session, select
from pydantic import EmailStr, ValidationError, validate_email
from sqlalchemy import or_, func, desc
from app.core.config import settings
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.models.models import User, UserRole, VerificationCodeDB, RevokedToken, OAuthProvider, Feature, PropertyCategory
from app.core.email import send_email
from app.core.constants import ROLE_ASSIGNMENT_ERROR, ADMIN_CREATION_RESTRICTION, VERIFICATION_EMAIL_SUBJECT, VERIFICATION_EMAIL_BODY
from app.models.user_schemas import UserUpdate
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

# Email configuration constants
SMTP_HOST = settings.SMTP_HOST
SMTP_PORT = settings.SMTP_PORT
SMTP_USER = settings.SMTP_USER
SMTP_PASSWORD = settings.SMTP_PASSWORD
EMAILS_FROM_EMAIL = settings.EMAILS_FROM_EMAIL

# Security constants
TOKEN_TYPE_BEARER = "bearer"


class VerificationCode:
    """Class to manage email verification codes."""

    def __init__(self):
        self.code: str = None
        self.email: str = None
        self.created_at: datetime = None
        self.expires_at: datetime = None

    def generate(self, email: str) -> str:
        """
        Generate a new verification code with expiration time.
        """
        self.code = secrets.token_hex(3).upper()  # 6-character hex code
        self.email = email
        self.created_at = datetime.now(timezone.utc)
        self.expires_at = self.created_at + timedelta(minutes=10)
        return self.code

    def is_expired(self) -> bool:
        """
        Check if the verification code has expired.
        """
        return datetime.now(timezone.utc) > self.expires_at


def _ensure_role_permissions(current_user: Optional[User], role: UserRole):
    """
    Ensure the current user has permission to assign the given role.
    """
    if current_user is None or current_user.role != UserRole.admin:
        if role not in [UserRole.customer, UserRole.property_owner]:
            raise HTTPException(
                status_code=403,
                detail=ROLE_ASSIGNMENT_ERROR
            )
        if role == UserRole.admin:
            raise HTTPException(
                status_code=403,
                detail=ADMIN_CREATION_RESTRICTION
            )


def _validate_unique_user(session: Session, email: str, phone: Optional[str], oauth_uid: Optional[str] = None):
    """
    Check if the email, phone number, or oauth_uid already exists in the database.
    """
    try:
        validate_email(email)
    except ValidationError:
        raise HTTPException(status_code=400, detail="Invalid email format")

    query_conditions = [User.email == email]

    if oauth_uid is not None:
        query_conditions.append(User.oauth_uid == oauth_uid)

    if phone is not None:
        query_conditions.append(User.phone == phone)

    existing_user = session.exec(
        select(User).where(or_(*query_conditions))).first()

    if existing_user:
        if existing_user.email == email:
            raise HTTPException(status_code=400, detail="Email already in use")
        if phone is not None and existing_user.phone == phone:
            raise HTTPException(status_code=400, detail="Phone already in use")
        if oauth_uid is not None and existing_user.oauth_uid == oauth_uid:
            raise HTTPException(
                status_code=400, detail="OAuth ID already in use")


def _create_user_in_db(
    session: Session,
    name: str,
    email: str,
    phone: Optional[str],
    password: Optional[str],
    role: UserRole,
    id_card_url: Optional[str] = None,
    profile_picture_url: Optional[str] = None,
    oauth_provider: OAuthProvider = OAuthProvider.none,
    oauth_uid: Optional[str] = None
) -> User:
    """
    Create and add the user to the database but does not commit yet.
    """
    if role == UserRole.property_owner and not id_card_url:
        raise HTTPException(
            status_code=400,
            detail="ID card URL is required for property owners"
        )
    if profile_picture_url and len(profile_picture_url) > 255:
        raise HTTPException(
            status_code=400,
            detail="Profile picture URL too long"
        )
    db_user = User(
        name=name,
        email=email,
        phone=phone,
        hashed_password=get_password_hash(password) if password else None,
        oauth_provider=oauth_provider,
        oauth_uid=oauth_uid,
        role=role,
        id_card_url=id_card_url if role == UserRole.property_owner else None,
        profile_picture_url=profile_picture_url,
        # OAuth users are auto-verified
        is_email_verified=oauth_provider != OAuthProvider.none,
        is_approved=role == UserRole.customer,
        is_active=True
    )
    session.add(db_user)
    return db_user


def _generate_and_send_verification_code(session: Session, email: str):
    """
    Generate and store verification code, then send it via email.
    """
    reset_code = VerificationCode()
    code = reset_code.generate(email=email)
    verification = VerificationCodeDB(
        email=email,
        code=code,
        expires_at=reset_code.expires_at
    )
    session.add(verification)
    session.commit()

    try:
        send_email(
            recipient=email,
            subject=VERIFICATION_EMAIL_SUBJECT,
            body=VERIFICATION_EMAIL_BODY(code)
        )
    except HTTPException as e:
        session.rollback()
        session.delete(verification)
        session.commit()
        raise e


def create_db_user(
    *,
    session: Session,
    name: str,
    email: str,
    phone: Optional[str] = None,
    password: Optional[str] = None,
    role: UserRole,
    id_card_url: Optional[str] = None,
    profile_picture_url: Optional[str] = None,
    oauth_provider: OAuthProvider = OAuthProvider.none,
    oauth_uid: Optional[str] = None,
    current_user: Optional[User] = None
) -> User:
    """
    Create a new user in the database and send verification email if applicable.
    """
    _ensure_role_permissions(current_user, role)
    _validate_unique_user(session, email, phone, oauth_uid)

    try:
        db_user = _create_user_in_db(
            session=session,
            name=name,
            email=email,
            phone=phone,
            password=password,
            role=role,
            id_card_url=id_card_url,
            profile_picture_url=profile_picture_url,
            oauth_provider=oauth_provider,
            oauth_uid=oauth_uid
        )

        if password and oauth_provider == OAuthProvider.none:
            _generate_and_send_verification_code(session, email)

        session.commit()
        return db_user

    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail="Email, phone, or OAuth ID already in use"
        )


def get_user_by_id(*, session: Session, user_id: int) -> Optional[User]:
    """
    Retrieve a user by their ID.
    """
    if user_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    try:
        statement = select(User).where(User.user_id == user_id)
        return session.exec(statement).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error occurred")


def get_user_by_email(*, session: Session, email: str) -> Optional[User]:
    """
    Retrieve a user by their email address.
    """
    try:
        validate_email(email)
    except ValidationError:
        raise HTTPException(status_code=400, detail="Invalid email format")

    try:
        statement = select(User).where(User.email == email)
        return session.exec(statement).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error occurred")


def get_user_by_oauth_uid(*, session: Session, oauth_uid: str) -> Optional[User]:
    """
    Retrieve a user by their OAuth UID.
    """
    try:
        statement = select(User).where(User.oauth_uid == oauth_uid)
        return session.exec(statement).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error occurred")


def _validate_user_for_auth(user: User, password: Optional[str] = None) -> None:
    """
    Validate user credentials and status for authentication.
    """
    if user.oauth_provider != OAuthProvider.none and password:
        raise HTTPException(status_code=400, detail="Use OAuth login")
    if user.oauth_provider == OAuthProvider.none and not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=401, detail="Invalid email or password")
    if not user.is_email_verified and user.oauth_provider == OAuthProvider.none:
        raise HTTPException(status_code=403, detail="Please verify your email")
    if not user.is_approved:
        raise HTTPException(
            status_code=403, detail="Account awaiting approval")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")


def authenticate_user(
    *,
    session: Session,
    email: str,
    password: str
) -> Dict[str, str]:
    """
    Authenticate a user and return access and refresh tokens.
    """
    try:
        validate_email(email)
    except ValidationError:
        raise HTTPException(status_code=400, detail="Invalid email format")

    if not password:
        raise HTTPException(status_code=400, detail="Password is required")

    user = get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(
            status_code=401, detail="Invalid email or password")

    _validate_user_for_auth(user, password)

    access_token = create_access_token(
        user_id=user.user_id, email=user.email, role=user.role)
    refresh_token = create_refresh_token(user_id=user.user_id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": TOKEN_TYPE_BEARER,
        "user": {
            "id": str(user.user_id),
            "email": user.email,
            "role": user.role.value,
            "name": user.name
        }
    }


def authenticate_google_user(
    *,
    session: Session,
    email: str,
    google_id: str,
    name: str,
    profile_picture_url: Optional[str] = None
) -> Dict[str, str]:
    """
    Authenticate or create a Google OAuth user and return tokens.
    """
    try:
        validate_email(email)
    except ValidationError:
        raise HTTPException(status_code=400, detail="Invalid email format")

    user = get_user_by_oauth_uid(session=session, oauth_uid=google_id)
    if not user:
        user = get_user_by_email(session=session, email=email)
        if user and user.oauth_provider != OAuthProvider.none:
            raise HTTPException(
                status_code=400,
                detail="Email associated with another OAuth provider"
            )
        if user:
            # Update existing user to link Google OAuth
            user.oauth_provider = OAuthProvider.google
            user.oauth_uid = google_id
            user.is_email_verified = True
            session.add(user)
            session.commit()
        else:
            # Create new user
            user = create_db_user(
                session=session,
                name=name,
                email=email,
                phone=None,
                password=None,
                role=UserRole.customer,
                id_card_url=None,
                profile_picture_url=profile_picture_url,
                oauth_provider=OAuthProvider.google,
                oauth_uid=google_id
            )

    _validate_user_for_auth(user)

    access_token = create_access_token(
        user_id=user.user_id, email=user.email, role=user.role)
    refresh_token = create_refresh_token(user_id=user.user_id)
    response = {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": TOKEN_TYPE_BEARER
    }
    if not user.is_approved:
        response["message"] = "Account is awaiting approval."
    return response


def validate_email(email: str):
    # This is a basic example; Pydantic's EmailStr does more.
    if "@" not in email:
        raise ValidationError("Invalid email format")


# --- Original function modified for print() ---
def verify_email_code(*, session: Session, email: str, code: str) -> Dict[str, str]:
    """
    Verify an email verification code and return tokens.
    """
    print(f"DEBUG: Starting verification for email: {email}, code: {code}")

    try:
        validate_email(email)
    except ValidationError:
        print(f"WARNING: Invalid email format: {email}")
        raise HTTPException(status_code=400, detail="Invalid email format")

    if not code or len(code) != 6 or not code.isalnum():
        print(f"WARNING: Invalid code format: {code}")
        raise HTTPException(
            status_code=400, detail="Invalid verification code format")

    try:
        # --- THIS IS THE CRUCIAL CHANGE ---
        # Uncomment your actual SQLAlchemy/SQLModel query

        verification = session.exec(
            select(VerificationCodeDB)
            .where(VerificationCodeDB.email == email)
            # assuming you have a created_at timestamp
            .order_by(desc(VerificationCodeDB.created_at))
        ).first()

        print(
            f"DEBUG: Fetched Verification record: {verification.email if verification else 'None'}")
        if verification:
            print(
                f"DEBUG: Verification code from DB: {verification.code}, Expires: {verification.expires_at}")
            print(f"DEBUG: Current UTC time: {datetime.now(timezone.utc)}")

            # Ensure expires_at always has tzinfo for comparison
            expires_at_utc = verification.expires_at
            if expires_at_utc.tzinfo is None:
                # If your DB stores naive datetimes, assume UTC or your configured backend timezone
                print("WARNING: expires_at is naive, assuming UTC for comparison.")
                expires_at_utc = expires_at_utc.replace(tzinfo=timezone.utc)

            is_expired = datetime.now(timezone.utc) > expires_at_utc
            is_code_match = verification.code == code

            print(f"DEBUG: Is code expired? {is_expired}")
            print(f"DEBUG: Does provided code match DB code? {is_code_match}")

        if not verification or \
           (verification and is_expired) or \
           (verification and not is_code_match):  # Changed this for clarity based on previous line

            print(f"DEBUG: Inside the verification failure condition.")
            if verification and is_expired:
                print(
                    f"INFO: Verification code expired for: {email}. Deleting it.")
                # session.delete(verification) # Uncomment for actual DB
                # session.commit() # Uncomment for actual DB
            print(
                f"WARNING: Verification failed for {email}: Invalid, expired, or used code.")
            raise HTTPException(
                status_code=401, detail="Invalid or expired verification code")

        user = get_user_by_email(session=session, email=email)
        print(f"DEBUG: User fetched: {user.email if user else 'None'}")

        if not user:
            print(
                f"WARNING: No user found for email: {email} after code verification.")
            raise HTTPException(
                status_code=401, detail="Invalid or expired verification code")

        if not user.is_active:
            print(f"WARNING: User is not active: {email}")
            raise HTTPException(
                status_code=403, detail="Account is deactivated")

        # Uncomment these lines to actually update the DB and delete the code
        user.is_email_verified = True
        session.add(user)
        session.delete(verification)
        session.commit()
        print("DEBUG: User email verification status updated and code marked as used (simulated).")

        print(f"DEBUG: User verified and tokens being generated for: {email}")

        access_token = create_access_token(
            user_id=user.user_id, email=user.email, role=user.role)
        refresh_token = create_refresh_token(user_id=user.user_id)

        response = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": TOKEN_TYPE_BEARER
        }

        if not user.is_approved:
            response["message"] = "Email verified, but account is awaiting approval."
            print(f"INFO: User {email} email verified, but awaiting approval.")

        return response

    except HTTPException:
        # Re-raise HTTPExceptions as they are already handled
        raise
    except Exception as e:
        print(
            f"ERROR: An unexpected error occurred during email verification: {e}")
        raise HTTPException(
            status_code=500, detail="Internal server error during verification.")

    except HTTPException as e:
        # FastAPI will catch this and send the appropriate HTTP response
        print(f"ERROR: Caught HTTPException: {e.status_code} - {e.detail}")
        raise  # Re-raise to let FastAPI handle it
    except Exception as e:
        # This will catch any other unexpected errors
        print(
            f"CRITICAL: Unexpected error during email verification for {email}: {e}")
        # session.rollback() # Uncomment for actual DB
        raise HTTPException(status_code=500, detail="Database error occurred")


def request_password_reset(*, session: Session, email: str) -> None:
    """
    Request a password reset by sending a reset code to the user's email.
    """
    try:
        validate_email(email)
    except ValidationError:
        raise HTTPException(status_code=400, detail="Invalid email format")

    try:
        user = get_user_by_email(session=session, email=email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.oauth_provider != OAuthProvider.none:
            raise HTTPException(
                status_code=400,
                detail="Password reset not available for OAuth users"
            )

        reset_code = VerificationCode()
        code = reset_code.generate(email=email)
        verification = VerificationCodeDB(
            email=email,
            code=code,
            expires_at=reset_code.expires_at
        )
        session.add(verification)
        session.commit()

        try:
            send_email(
                recipient=email,
                subject="Password Reset Code",
                body=f"Your password reset code is: {code}\nValid for 10 minutes."
            )
        except HTTPException as e:
            session.rollback()
            session.delete(verification)
            session.commit()
            raise e
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail="A reset request is already pending for this email"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error occurred")


def reset_password(
    *, session: Session, email: str, code: str, new_password: str
) -> bool:
    """
    Reset the user's password using a verification code.
    """
    try:
        validate_email(email)
    except ValidationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid input provided.")

    if not code or len(code) != 6 or not code.isalnum():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid input provided.")

    if not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid input provided.")

    try:
        user = get_user_by_email(session=session, email=email)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Invalid email or verification code.")

        if user.oauth_provider != OAuthProvider.none:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset method not applicable for this account."
            )

        verification = session.exec(
            select(VerificationCodeDB).where(VerificationCodeDB.email == email)
        ).first()

        if not verification:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or verification code.")

        current_utc_time = datetime.now(timezone.utc)

        expires_at_aware = verification.expires_at.replace(tzinfo=timezone.utc)

        if current_utc_time > expires_at_aware:
            try:
                session.delete(verification)
                session.commit()
            except SQLAlchemyError:
                session.rollback()
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                    detail="An internal server error occurred.")
            except Exception:
                session.rollback()
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                    detail="An internal server error occurred.")

            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Invalid email or verification code.")

        if verification.code != code:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Invalid email or verification code.")

        try:
            user.hashed_password = get_password_hash(new_password)
            session.add(user)
            session.delete(verification)
            session.commit()
            return True
        except SQLAlchemyError:
            session.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail="An internal server error occurred.")
        except Exception:
            session.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail="An internal server error occurred.")

    except HTTPException:
        raise
    except Exception:  # Removed 'as e' as you don't need 'e' for generic 500
        if session.is_active:
            session.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="An internal server error occurred.")


def revoke_token(*, session: Session, token: str, expires_at: datetime) -> None:
    """
    Revoke a JWT token by adding it to the RevokedToken table.
    """
    if not token:
        raise HTTPException(status_code=400, detail="Token is required")

    try:
        revoked_token = RevokedToken(
            token=token,
            expires_at=expires_at
        )
        session.add(revoked_token)
        session.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error occurred")


def is_token_revoked(*, session: Session, token: str) -> bool:
    """
    Check if a JWT token is revoked.
    """
    if not token:
        raise HTTPException(status_code=400, detail="Token is required")

    try:
        statement = select(RevokedToken).where(RevokedToken.token == token)
        revoked_token = session.exec(statement).first()
        if revoked_token and revoked_token.expires_at > datetime.now(timezone.utc):
            return True
        return False
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error occurred")


def update_user_in_db(
    session: Session,
    db_user: User,
    user_data: UserUpdate,
    current_user: User
) -> User:
    try:
        if user_data.email and user_data.email != db_user.email:
            try:
                validate_email(user_data.email)
            except ValidationError:
                raise HTTPException(
                    status_code=400, detail="Invalid email format")
            existing_email = get_user_by_email(
                session=session, email=user_data.email)
            if existing_email:
                raise HTTPException(
                    status_code=400,
                    detail="Email already in use"
                )
            db_user.email = user_data.email

        if user_data.phone and user_data.phone != db_user.phone:
            if len(user_data.phone) > 20:
                raise HTTPException(
                    status_code=400, detail="Phone number too long")
            existing_phone = session.exec(
                select(User).where(User.phone == user_data.phone)
            ).first()
            if existing_phone:
                raise HTTPException(
                    status_code=400,
                    detail="Phone number already in use"
                )
            db_user.phone = user_data.phone

        if user_data.name:
            if len(user_data.name) > 100:
                raise HTTPException(status_code=400, detail="Name too long")
            db_user.name = user_data.name

        if user_data.profile_picture_url is not None:
            if len(user_data.profile_picture_url) > 255:
                raise HTTPException(
                    status_code=400, detail="Profile picture URL too long")
            db_user.profile_picture_url = user_data.profile_picture_url

        admin_only_fields = ['is_active', 'is_approved', 'role', 'id_card_url']
        for field in admin_only_fields:
            if getattr(user_data, field, None) is not None and current_user.role != UserRole.admin:
                raise HTTPException(
                    status_code=403,
                    detail=f"You are not authorized to update '{field}'"
                )

        if current_user.role == UserRole.admin:
            if user_data.is_active is not None:
                db_user.is_active = user_data.is_active
            if user_data.is_approved is not None:
                db_user.is_approved = user_data.is_approved
            if user_data.role:
                db_user.role = user_data.role
            if user_data.id_card_url and db_user.role == UserRole.property_owner:
                if len(user_data.id_card_url) > 255:
                    raise HTTPException(
                        status_code=400, detail="ID card URL too long")
                db_user.id_card_url = user_data.id_card_url

        session.add(db_user)
        session.commit()
        return db_user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Database error occurred")


def search_users(
    session: Session,
    name: Optional[str] = None,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    is_approved: Optional[bool] = None,
    skip: int = 0,
    limit: int = 10
) -> List[User]:
    """
    Search users by name, email, phone, role, or status with pagination.
    """
    query = select(User)

    # Combined search for name and email
    if name:
        search_term = f"%{name}%"
        query = query.where(
            or_(
                User.name.ilike(search_term),
                User.email.ilike(search_term)
            )
        )

    if phone:
        query = query.where(User.phone.ilike(f"%{phone}%"))
    if role:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    if is_approved is not None:
        query = query.where(User.is_approved == is_approved)

    return session.exec(query.offset(skip).limit(limit)).all()


def list_users(session: Session, skip: int = 0, limit: int = 10) -> List[User]:
    """
    Retrieve a paginated list of all users.
    """
    return session.exec(select(User).offset(skip).limit(limit)).all()


def delete_user(session: Session, user_id: int, hard_delete: bool = False) -> bool:
    """
    Delete a user (soft delete by setting is_active=False or hard delete by removing from database).
    Returns True if deletion was successful.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if hard_delete:
        session.delete(user)
    else:
        user.is_active = False
        session.add(user)

    session.commit()
    return True


def get_user_count(
    session: Session,
    name: Optional[str] = None,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    is_approved: Optional[bool] = None
) -> int:
    """
    Get total count of users with filters.
    """
    query = select(func.count()).select_from(User)

    # Combined search for name and email
    if name:
        search_term = f"%{name}%"
        query = query.where(
            or_(
                User.name.ilike(search_term),
                User.email.ilike(search_term)
            )
        )

    if phone:
        query = query.where(User.phone.ilike(f"%{phone}%"))
    if role:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    if is_approved is not None:
        query = query.where(User.is_approved == is_approved)

    return session.exec(query).first() or 0
