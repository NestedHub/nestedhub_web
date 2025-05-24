import pytest
from sqlmodel import Session, SQLModel, create_engine, select
from sqlalchemy.pool import StaticPool
from sqlalchemy.exc import IntegrityError
from app.models.models import User, Property, ViewingRequest, PropertyCategory
from app.models.enums import UserRole, PropertyStatusEnum, ViewingRequestStatusEnum
from app.models.viewing_schemas import ViewingRequestCreate, ViewingRequestUpdate
from app.crud.crud_viewing import (
    create_viewing_request,
    get_viewing_request,
    get_user_viewing_requests,
    get_user_upcoming_viewings_request,
    update_viewing_request,
    delete_viewing_request,
    accept_viewing_request,
    deny_viewing_request,
    get_property_viewing_requests,
    get_owner_viewing_requests,
    get_owner_upcoming_viewings_request
)
from fastapi import HTTPException
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

# Test CRUD functions
def test_create_viewing_request(db_session, test_customer, setup_common_data):
    viewing_request_data = ViewingRequestCreate(
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1)
    )
    result = create_viewing_request(
        db=db_session,
        viewing_request=viewing_request_data,
        user_id=test_customer.user_id
    )
    assert result.user_id == test_customer.user_id
    assert result.property_id == 1
    assert result.status == ViewingRequestStatusEnum.pending
    db_session.commit()

def test_create_viewing_request_property_not_found(db_session, test_customer):
    viewing_request_data = ViewingRequestCreate(
        property_id=999,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1)
    )
    with pytest.raises(HTTPException) as exc:
        create_viewing_request(
            db=db_session,
            viewing_request=viewing_request_data,
            user_id=test_customer.user_id
        )
    assert exc.value.status_code == 404
    assert exc.value.detail == "Property not found"

def test_create_viewing_request_user_not_found(db_session, setup_common_data):
    viewing_request_data = ViewingRequestCreate(
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1)
    )
    with pytest.raises(HTTPException) as exc:
        create_viewing_request(
            db=db_session,
            viewing_request=viewing_request_data,
            user_id=999
        )
    assert exc.value.status_code == 404
    assert exc.value.detail == "User not found"

def test_get_viewing_request(db_session, test_customer, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=test_customer.user_id,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    result = get_viewing_request(db=db_session, request_id=1)
    assert result.request_id == 1
    assert result.user_id == test_customer.user_id
    db_session.commit()

def test_get_viewing_request_not_found(db_session):
    with pytest.raises(HTTPException) as exc:
        get_viewing_request(db=db_session, request_id=999)
    assert exc.value.status_code == 404
    assert exc.value.detail == "Viewing request not found"

def test_get_user_viewing_requests(db_session, test_customer, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=test_customer.user_id,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    result = get_user_viewing_requests(db=db_session, user_id=test_customer.user_id)
    assert len(result) == 1
    assert result[0].request_id == 1
    db_session.commit()

def test_get_user_upcoming_viewings_request(db_session, test_customer, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=test_customer.user_id,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    result = get_user_upcoming_viewings_request(db=db_session, user_id=test_customer.user_id)
    assert len(result) == 1
    assert result[0].request_id == 1
    db_session.commit()

def test_update_viewing_request(db_session, test_customer, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=test_customer.user_id,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    update_data = ViewingRequestUpdate(
        requested_time=datetime.now(timezone.utc) + timedelta(days=2)
    )
    result = update_viewing_request(
        db=db_session,
        request_id=1,
        viewing_request_update=update_data,
        user_id=test_customer.user_id
    )
    assert result.requested_time.timestamp() == update_data.requested_time.timestamp()
    db_session.commit()

def test_update_viewing_request_unauthorized(db_session, test_customer, test_owner, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=test_customer.user_id,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    update_data = ViewingRequestUpdate(
        requested_time=datetime.now(timezone.utc) + timedelta(days=2)
    )
    with pytest.raises(HTTPException) as exc:
        update_viewing_request(
            db=db_session,
            request_id=1,
            viewing_request_update=update_data,
            user_id=test_owner.user_id
        )
    assert exc.value.status_code == 403
    assert exc.value.detail == "Not authorized to update this request"

def test_delete_viewing_request(db_session, test_customer, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=test_customer.user_id,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    delete_viewing_request(
        db=db_session,
        request_id=1,
        user_id=test_customer.user_id
    )
    assert db_session.get(ViewingRequest, 1) is None
    db_session.commit()

def test_delete_viewing_request_unauthorized(db_session, test_customer, test_owner, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=test_customer.user_id,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    with pytest.raises(HTTPException) as exc:
        delete_viewing_request(
            db=db_session,
            request_id=1,
            user_id=test_owner.user_id
        )
    assert exc.value.status_code == 403
    assert exc.value.detail == "Not authorized to delete this request"

def test_accept_viewing_request(db_session, test_owner, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=1,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    result = accept_viewing_request(
        db=db_session,
        request_id=1,
        user_id=test_owner.user_id
    )
    assert result.status == ViewingRequestStatusEnum.accepted
    db_session.commit()

def test_accept_viewing_request_unauthorized(db_session, test_customer, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=test_customer.user_id,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    with pytest.raises(HTTPException) as exc:
        accept_viewing_request(
            db=db_session,
            request_id=1,
            user_id=test_customer.user_id
        )
    assert exc.value.status_code == 403
    assert exc.value.detail == "Not authorized to accept this request"

def test_deny_viewing_request(db_session, test_owner, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=1,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    result = deny_viewing_request(
        db=db_session,
        request_id=1,
        user_id=test_owner.user_id
    )
    assert result.status == ViewingRequestStatusEnum.denied
    db_session.commit()

def test_deny_viewing_request_unauthorized(db_session, test_customer, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=test_customer.user_id,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    with pytest.raises(HTTPException) as exc:
        deny_viewing_request(
            db=db_session,
            request_id=1,
            user_id=test_customer.user_id
        )
    assert exc.value.status_code == 403
    assert exc.value.detail == "Not authorized to deny this request"

def test_get_property_viewing_requests(db_session, test_owner, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=1,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    result = get_property_viewing_requests(
        db=db_session,
        property_id=1,
        user_id=test_owner.user_id
    )
    assert len(result) == 1
    assert result[0].request_id == 1
    db_session.commit()

def test_get_owner_viewing_requests(db_session, test_owner, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=1,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    result = get_owner_viewing_requests(db=db_session, user_id=test_owner.user_id)
    assert len(result) == 1
    assert result[0].request_id == 1
    db_session.commit()

def test_get_owner_upcoming_viewings_request(db_session, test_owner, setup_common_data):
    viewing_request = ViewingRequest(
        request_id=1,
        user_id=1,
        property_id=1,
        requested_time=datetime.now(timezone.utc) + timedelta(days=1),
        status=ViewingRequestStatusEnum.pending
    )
    db_session.add(viewing_request)
    db_session.commit()
    result = get_owner_upcoming_viewings_request(db=db_session, user_id=test_owner.user_id)
    assert len(result) == 1
    assert result[0].request_id == 1
    db_session.commit()