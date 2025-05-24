import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlalchemy.pool import StaticPool
from sqlalchemy.exc import IntegrityError
from app.api.deps import get_db_session, get_current_user, require_customer, require_owner_or_admin
from app.models.models import User, Property, ViewingRequest, PropertyCategory
from app.models.enums import UserRole, PropertyStatusEnum, ViewingRequestStatusEnum
from app.models.viewing_schemas import ViewingRequestCreate, ViewingRequestUpdate
from app.main import app
from datetime import datetime, timezone, timedelta

# Run tests sequentially to avoid SQLite locking
pytestmark = pytest.mark.serial

# Setup in-memory SQLite database for testing


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
        session.rollback()
    SQLModel.metadata.drop_all(engine)

# Setup test client


@pytest.fixture
def client(db_session, test_customer, test_owner):
    def override_get_db_session():
        yield db_session

    def override_get_current_user():
        return test_customer  # Full User instance

    def override_require_customer():
        return test_customer  # Full User instance

    def override_require_owner_or_admin():
        return test_owner  # Full User instance

    app.dependency_overrides[get_db_session] = override_get_db_session
    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[require_customer] = override_require_customer
    app.dependency_overrides[require_owner_or_admin] = override_require_owner_or_admin

    yield TestClient(app)
    app.dependency_overrides.clear()

# Setup test user (customer)


@pytest.fixture
def test_customer(db_session):
    user = User(
        user_id=1,
        email="customer@example.com",
        name="Customer User",
        role=UserRole.customer,
        is_active=True,
        is_approved=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

# Setup test user (property owner)


@pytest.fixture
def test_owner(db_session):
    user = User(
        user_id=2,
        email="owner@example.com",
        name="Owner User",
        role=UserRole.property_owner,
        is_active=True,
        is_approved=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

# Setup common test data (property and category)


@pytest.fixture
def setup_common_data(db_session, test_owner):
    category = PropertyCategory(category_id=1, category_name="Apartment")
    property = Property(
        property_id=1,
        title="Test Property",
        user_id=test_owner.user_id,
        category_id=1,
        status=PropertyStatusEnum.available,
        listed_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        bedrooms=2,
        bathrooms=1,
        land_area=100.0,
        floor_area=80.0,
        description="Test Description"
    )
    db_session.add_all([category, property])
    try:
        db_session.commit()
    except IntegrityError as e:
        print(f"IntegrityError in setup_common_data: {e}")
        raise
    return {"category": category, "property": property}

# Test API endpoints


def test_create_viewing_request_api(client, setup_common_data):
    viewing_request_data = {
        "property_id": 1,
        "requested_time": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    }
    response = client.post("/api/viewing-requests/", json=viewing_request_data)
    assert response.status_code == 200
    assert response.json()["property_id"] == 1
    assert response.json()["status"] == "pending"


def test_get_viewing_request_api(client, db_session, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=1,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    response = client.get("/api/viewing-requests/1")
    assert response.status_code == 200
    assert response.json()["request_id"] == 1


def test_get_user_viewing_requests_api(client, db_session, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=1,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    response = client.get("/api/viewing-requests/")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["request_id"] == 1


def test_get_user_upcoming_viewings_api(client, db_session, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=1,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    response = client.get("/api/viewing-requests/upcoming")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["request_id"] == 1


def test_update_viewing_request_api(client, db_session, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=1,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()

    # Prepare the update data with a timezone-aware datetime
    new_requested_time = datetime.now(timezone.utc) + timedelta(days=2)
    update_data = {
        "requested_time": new_requested_time.isoformat()
    }

    response = client.patch("/api/viewing-requests/1", json=update_data)
    assert response.status_code == 200

    # Parse both the response and expected datetime for comparison
    response_time = datetime.fromisoformat(response.json()["requested_time"])
    expected_time = new_requested_time

    # Ensure both are timezone-aware and in UTC for reliable comparison
    if response_time.tzinfo is None:
        response_time = response_time.replace(tzinfo=timezone.utc)
    expected_time = expected_time.astimezone(timezone.utc)

    assert response_time == expected_time


def test_delete_viewing_request_api(client, db_session, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=1,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    response = client.delete("/api/viewing-requests/1")
    assert response.status_code == 200
    assert response.json()["message"] == "Viewing request deleted successfully"


def test_accept_viewing_request_api(client, db_session, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=1,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    response = client.post("/api/viewing-requests/1/accept")
    assert response.status_code == 200
    assert response.json()["status"] == "accepted"


def test_deny_viewing_request_api(client, db_session, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=1,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    response = client.post("/api/viewing-requests/1/deny")
    assert response.status_code == 200
    assert response.json()["status"] == "denied"


def test_get_property_viewing_requests_api(client, db_session, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=1,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    response = client.get("/api/viewing-requests/property/1")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["request_id"] == 1


def test_get_owner_viewing_requests_api(client, db_session, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=1,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    response = client.get("/api/viewing-requests/owner/requests")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["request_id"] == 1


def test_get_owner_upcoming_viewings_api(client, db_session, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=1,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    response = client.get("/api/viewing-requests/owner/upcoming")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["request_id"] == 1
