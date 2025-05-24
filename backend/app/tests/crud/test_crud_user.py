from app.crud.crud_user import verify_email_code
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, ANY
import pytest
from datetime import datetime, timedelta, timezone
from sqlmodel import Session, select
from fastapi import HTTPException
from unittest.mock import patch, MagicMock
from app.models.models import User, UserRole, VerificationCodeDB, RevokedToken
from app.core.security import get_password_hash
from app.crud.crud_user import (
    create_db_user,
    get_user_by_id,
    get_user_by_email,
    authenticate_user,
    verify_email_code,
    request_password_reset,
    reset_password,
    revoke_token,
    is_token_revoked,
    update_user_in_db,
    _ensure_role_permissions,
    _validate_unique_user
)
from app.models.user_schemas import UserUpdate

# Fixtures


@pytest.fixture
def mock_session():
    return MagicMock(spec=Session)


@pytest.fixture
def mock_current_user_admin():
    user = MagicMock(spec=User)
    user.role = UserRole.admin
    return user


@pytest.fixture
def mock_current_user_customer():
    user = MagicMock(spec=User)
    user.role = UserRole.customer
    return user


# Test data
TEST_USER_DATA = {
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "securepassword123",
    "role": UserRole.customer
}

# Tests for create_db_user


def test_create_user_success(mock_session):
    # Simulate no existing user found (so first() returns None)
    mock_exec_result = MagicMock()
    mock_exec_result.first.return_value = None
    mock_session.exec.return_value = mock_exec_result

    with patch("app.crud.crud_user.send_email") as mock_send_email:
        result = create_db_user(
            session=mock_session,
            **TEST_USER_DATA,
            current_user=None
        )

        assert isinstance(result, User)
        mock_session.add.assert_called()
        mock_session.commit.assert_called()
        mock_send_email.assert_called_once()


def test_create_user_duplicate_email(mock_session):
    mock_session.exec.return_value.first.return_value = User(**TEST_USER_DATA)
    with pytest.raises(HTTPException) as exc:
        create_db_user(session=mock_session, **TEST_USER_DATA)
    assert "already in use" in str(exc.value.detail)


def test_create_admin_without_permissions(mock_session, mock_current_user_customer):
    test_data = TEST_USER_DATA.copy()
    test_data.pop('role', None)  # Safely remove 'role' if it exists

    with pytest.raises(HTTPException) as exc:
        create_db_user(
            session=mock_session,
            **test_data,
            role=UserRole.admin,
            current_user=mock_current_user_customer
        )
    assert "Only admins can assign" in str(exc.value.detail)

# Tests for get_user_by_id


def test_get_user_by_id_found(mock_session):
    mock_user = User(**TEST_USER_DATA)
    mock_session.exec.return_value.first.return_value = mock_user
    result = get_user_by_id(session=mock_session, user_id=1)
    assert result == mock_user


def test_get_user_by_id_not_found(mock_session):
    mock_session.exec.return_value.first.return_value = None
    result = get_user_by_id(session=mock_session, user_id=999)
    assert result is None

# Tests for authenticate_user


def test_authenticate_success(mock_session):
    hashed_password = get_password_hash("securepassword123")
    mock_user = User(
        **TEST_USER_DATA,
        hashed_password=hashed_password,
        is_email_verified=True,
        is_approved=True,
        is_active=True
    )
    mock_session.exec.return_value.first.return_value = mock_user

    result = authenticate_user(
        session=mock_session,
        email="test@example.com",
        password="securepassword123"
    )

    assert "access_token" in result
    assert "refresh_token" in result


def test_authenticate_unverified_email(mock_session):
    mock_user = User(**TEST_USER_DATA, is_email_verified=False)
    mock_session.exec.return_value.first.return_value = mock_user

    with pytest.raises(HTTPException) as exc:
        authenticate_user(
            session=mock_session,
            email="test@example.com",
            password="securepassword123"
        )
    assert "verify your email" in str(exc.value.detail)

# Tests for verify_email_code


# Assuming TEST_USER_DATA is already defined with necessary user data, including `is_active`, `is_approved`, etc.


@patch('app.crud.crud_user.get_user_by_email')
def test_verify_email_code_success(mock_get_user_by_email, mock_session):
    # Mock the VerificationCodeDB object
    mock_verification = VerificationCodeDB(
        email="test@example.com",
        code="ABC123",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
    )

    # Create a mock User object with necessary fields
    mock_user = User(
        user_id=1,
        name="Test User",
        email="test@example.com",
        hashed_password="hashedpassword",
        # Initial value (it should become True after the code verification)
        is_email_verified=False,
        is_approved=True,         # Assume the user is approved
        is_active=True,           # Assume the user is active
        role=UserRole.customer,          # Assuming this is the correct role
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )

    # Mock the session query to return the verification code
    mock_session.exec.return_value.first.return_value = mock_verification

    # Mock get_user_by_email to return the mock_user
    mock_get_user_by_email.return_value = mock_user

    # Call the function you're testing
    result = verify_email_code(
        session=mock_session,
        email="test@example.com",
        code="ABC123"
    )

    # Assertions to validate the test outcome
    # Check that email verification was successful
    assert mock_user.is_email_verified is True
    assert "access_token" in result  # Check that access_token was returned
    # Ensure that verification code was deleted
    mock_session.delete.assert_called_with(mock_verification)


# Tests for update_user_in_db


def test_update_user_email(mock_session, mock_current_user_customer):
    existing_user = User(
        user_id=1,
        email="old@example.com",
        role=UserRole.customer,
        is_active=True
    )
    update_data = {"email": "new@example.com"}

    mock_session.exec.return_value.first.return_value = None  # No existing email
    result = update_user_in_db(
        session=mock_session,
        db_user=existing_user,
        user_data=UserUpdate(**update_data),
        current_user=mock_current_user_customer
    )

    assert result.email == "new@example.com"


def test_update_admin_only_field_non_admin(mock_session, mock_current_user_customer):
    existing_user = User(user_id=1, role=UserRole.customer)
    update_data = {"is_active": False}

    with pytest.raises(HTTPException) as exc:
        update_user_in_db(
            session=mock_session,
            db_user=existing_user,
            user_data=UserUpdate(**update_data),
            current_user=mock_current_user_customer
        )
    assert "403" in str(exc.value.status_code)

# Tests for password reset


def test_password_reset_success(mock_session):
    mock_verification = VerificationCodeDB(
        email="test@example.com",
        code="ABC123",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
    )
    mock_user = User(**TEST_USER_DATA)

    # Create mock result objects that have a `.first()` method
    mock_user_result = MagicMock()
    mock_user_result.first.return_value = mock_user

    mock_verification_result = MagicMock()
    mock_verification_result.first.return_value = mock_verification

    mock_session.exec.side_effect = [
        mock_user_result,
        mock_verification_result
    ]

    result = reset_password(
        session=mock_session,
        email="test@example.com",
        code="ABC123",
        new_password="newpassword123"
    )

    assert result is True


# Tests for token revocation

def test_revoke_token(mock_session):
    test_token = "testtoken123"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)

    revoke_token(
        session=mock_session,
        token=test_token,
        expires_at=expires_at
    )

    mock_session.add.assert_called_with(RevokedToken(
        token=test_token,
        expires_at=expires_at,
        created_at=ANY  # This allows any timestamp
    ))


# ... Additional tests for other functions and edge cases
