import time
import requests
import re
import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy.pool import StaticPool
from app.main import app
from app.api.deps import get_db_session, get_current_user
from app.models.models import User, UserRole
from unittest.mock import patch

# ---- Setup in-memory DB ----
@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

# ---- Setup test client ----
@pytest.fixture
def client(db_session):
    def override_get_db_session():
        yield db_session

    app.dependency_overrides[get_db_session] = override_get_db_session
    yield TestClient(app)
    app.dependency_overrides.clear()

# ---- Mock current_user for optional dependency ----
@pytest.fixture
def no_current_user():
    def override_get_current_user():
        return None
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield
    app.dependency_overrides.clear()

# ---- Test: Register User ----
def test_user_register(client, db_session, no_current_user):
    user_payload = {
        "email": "test@example.com",
        "name": "Test User",
        "phone": "0123456789",
        "password": "securepassword",
        "role": "customer",  # or "property_owner"
        "id_card_url": None
    }

    response = client.post("/api/users/register", json=user_payload)

    print("RESPONSE STATUS:", response.status_code)
    print("RESPONSE JSON:", response.json())  # or response.text if json fails

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["role"] == "customer"
    assert data["is_email_verified"] is False
    assert data["is_active"] is True

# ---- Helper: Extract verification code from MailCatcher email ----
def extract_verification_code_from_email(body: str) -> str:
    match = re.search(r"Your verification code is: (\w+)", body)
    return match.group(1) if match else None

def get_latest_verification_code(email: str, timeout: float = 5.0):
    """Poll MailCatcher for email to a given address, return verification code."""
    base_url = "http://localhost:1080"
    start = time.time()

    while time.time() - start < timeout:
        resp = requests.get(f"{base_url}/messages")
        resp.raise_for_status()
        messages = resp.json()

        for message in reversed(messages):
            if email in message["recipients"]:
                message_id = message["id"]
                content_resp = requests.get(f"{base_url}/messages/{message_id}.plain")
                content_resp.raise_for_status()
                body = content_resp.text

                code = extract_verification_code_from_email(body)
                if code:
                    return code

        time.sleep(0.5)

    raise RuntimeError("Verification code not found in MailCatcher.")

# ---- Test: Verify Email End-to-End ----
def test_verify_email_end_to_end(client, db_session, no_current_user):
    user_payload = {
        "email": "test@example.com",
        "name": "Test User",
        "phone": "0123456789",
        "password": "securepassword",
        "role": "customer",
        "id_card_url": None
    }

    # Register the user (should trigger verification email)
    response = client.post("/api/users/register", json=user_payload)
    assert response.status_code == 200

    # Fetch verification code from MailCatcher
    code = get_latest_verification_code("test@example.com")
    assert code is not None

    # Use code to verify email
    verify_response = client.post("/api/users/verify-email", params={
        "email": "test@example.com",
        "code": code
    })

    assert verify_response.status_code == 200
    data = verify_response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
