import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlalchemy.pool import StaticPool
from sqlalchemy.exc import IntegrityError
from app.api.deps import get_db_session, get_current_user
from app.models.models import User, Property, PropertyCategory, City, District, Commune, PropertyPricing, PropertyLocation, PropertyMedia, Feature, PropertyFeature, WishList
from app.models.enums import UserRole, PropertyStatusEnum, MediaType
from app.models.property_schemas import PropertyCreate, PropertyUpdate, PropertyRead, PaginatedPropertyRead, PropertyComparisonRequest, PropertyPricingCreate, PropertyLocationCreate, PropertyMediaCreate
from app.main import app
from datetime import datetime, date
from decimal import Decimal

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
def client(db_session, test_user):
    def override_get_db_session():
        yield db_session

    def override_get_current_user():
        return test_user

    app.dependency_overrides[get_db_session] = override_get_db_session
    app.dependency_overrides[get_current_user] = override_get_current_user

    yield TestClient(app)
    app.dependency_overrides.clear()

# Setup test user
@pytest.fixture
def test_user(db_session):
    user = User(
        user_id=1,
        email="test@example.com",
        name="Test User",
        role=UserRole.property_owner,
        is_active=True,
        is_approved=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

# Setup mock current user
@pytest.fixture
def mock_current_user(test_user):
    def override_get_current_user():
        return test_user

    app.dependency_overrides[get_current_user] = override_get_current_user
    yield
    app.dependency_overrides.clear()

# Setup common test data
@pytest.fixture
def setup_common_data(db_session):
    category = PropertyCategory(category_id=1, category_name="Apartment")
    city = City(city_id=1, city_name="Hanoi")
    district = District(district_id=1, city_id=1, district_name="Ba Dinh")
    commune = Commune(commune_id=1, district_id=1, commune_name="Ngoc Ha")
    feature = Feature(feature_id=1, feature_name="Parking")
    db_session.add_all([category, city, district, commune, feature])
    try:
        db_session.commit()
    except IntegrityError as e:
        print(f"IntegrityError in setup_common_data: {e}")
        raise
    category_check = db_session.get(PropertyCategory, 1)
    assert category_check is not None, f"PropertyCategory not found: {category_check}"
    return {"category": category, "city": city, "district": district, "commune": commune, "feature": feature}

# Test API endpoints
def test_create_property_api(client, mock_current_user, db_session, setup_common_data):
    property_data = {
        "title": "Test Property",
        "description": "Test Description",
        "bedrooms": 2,
        "bathrooms": 1,
        "land_area": "100.0",
        "floor_area": "80.0",
        "status": "available",
        "category_id": 1,
        "pricing": {
            "rent_price": "1000.0",
            "electricity_price": "0.5",
            "water_price": "0.3",
            "available_from": date.today().isoformat()
        },
        "location": {
            "city_id": 1,
            "district_id": 1,
            "commune_id": 1,
            "street_number": "123 Test St",
            "latitude": "21.0",
            "longitude": "105.0"
        },
        "media": [
            {"media_url": "https://test.com/image.jpg", "media_type": "image"}
        ],
        "feature_ids": [1]
    }

    response = client.post("/api/properties/", json=property_data,
                           headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 201
    assert response.json()["title"] == "Test Property"

def test_get_property_api(client, db_session, setup_common_data):
    property = Property(
        property_id=1,
        title="Test Property",
        category_id=1,
        status=PropertyStatusEnum.available,
        listed_at=datetime.now(),
        updated_at=datetime.now(),
        bedrooms=2,
        bathrooms=1,
        land_area=Decimal("100.0"),
        floor_area=Decimal("80.0"),
        description="Test Description"
    )
    pricing = PropertyPricing(
        property_id=1,
        rent_price=Decimal("1000.0"),
        electricity_price=Decimal("0.5"),
        water_price=Decimal("0.3"),
        available_from=date.today()
    )
    location = PropertyLocation(
        property_id=1,
        city_id=1,
        district_id=1,
        commune_id=1,
        street_number="123 Test St",
        latitude=Decimal("21.0"),
        longitude=Decimal("105.0")
    )
    db_session.add_all([property, pricing, location])
    db_session.commit()

    response = client.get("/api/properties/1")
    assert response.status_code == 200
    assert response.json()["title"] == "Test Property"

def test_update_property_api(client, mock_current_user, db_session, setup_common_data):
    property = Property(
        property_id=1,
        title="Old Property",
        user_id=1,
        category_id=1,
        status=PropertyStatusEnum.available,
        listed_at=datetime.now(),
        updated_at=datetime.now(),
        bedrooms=2,
        bathrooms=1,
        land_area=Decimal("100.0"),
        floor_area=Decimal("80.0"),
        description="Old Description"
    )
    pricing = PropertyPricing(
        property_id=1,
        rent_price=Decimal("1000.0"),
        electricity_price=Decimal("0.5"),
        water_price=Decimal("0.3"),
        available_from=date.today()
    )
    location = PropertyLocation(
        property_id=1,
        city_id=1,
        district_id=1,
        commune_id=1,
        street_number="123 Test St",
        latitude=Decimal("21.0"),
        longitude=Decimal("105.0")
    )
    db_session.add_all([property, pricing, location])
    db_session.commit()

    update_data = {
        "title": "Updated Property",
        "pricing": {
            "rent_price": "1500.0",
            "electricity_price": "0.5",
            "water_price": "0.3",
            "available_from": date.today().isoformat()
        }
    }

    response = client.patch("/api/properties/1", json=update_data,
                            headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Property"

def test_delete_property_api(client, mock_current_user, db_session, setup_common_data):
    property = Property(
        property_id=1,
        title="Test Property",
        user_id=1,
        category_id=1,
        status=PropertyStatusEnum.available,
        listed_at=datetime.now(),
        updated_at=datetime.now(),
        bedrooms=2,
        bathrooms=1,
        land_area=Decimal("100.0"),
        floor_area=Decimal("80.0"),
        description="Test Description"
    )
    db_session.add(property)
    db_session.commit()

    response = client.delete(
        "/api/properties/1", headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 204

def test_search_properties_api(client, db_session, setup_common_data):
    property = Property(
        property_id=1,
        title="Test Property",
        category_id=1,
        status=PropertyStatusEnum.available,
        listed_at=datetime.now(),
        updated_at=datetime.now(),
        bedrooms=2,
        bathrooms=1,
        land_area=Decimal("100.0"),
        floor_area=Decimal("80.0"),
        description="Test Description"
    )
    location = PropertyLocation(
        property_id=1,
        city_id=1,
        district_id=1,
        commune_id=1,
        street_number="123 Test St",
        latitude=Decimal("21.0"),
        longitude=Decimal("105.0")
    )
    pricing = PropertyPricing(
        property_id=1,
        rent_price=Decimal("1000.0"),
        electricity_price=Decimal("0.5"),
        water_price=Decimal("0.3"),
        available_from=date.today()
    )
    db_session.add_all([property, location, pricing])
    db_session.commit()

    response = client.get("/api/properties/?keyword=Test&city_id=1")
    assert response.status_code == 200
    assert response.json()["total"] == 1
    assert len(response.json()["properties"]) == 1

def test_compare_properties_api(client, mock_current_user, db_session, setup_common_data):
    property = Property(
        property_id=1,
        title="Test Property",
        user_id=1,
        category_id=1,
        status=PropertyStatusEnum.available,
        listed_at=datetime.now(),
        updated_at=datetime.now(),
        bedrooms=2,
        bathrooms=1,
        land_area=Decimal("100.0"),
        floor_area=Decimal("80.0"),
        description="Test Description"
    )
    pricing = PropertyPricing(
        property_id=1,
        rent_price=Decimal("1000.0"),
        electricity_price=Decimal("0.5"),
        water_price=Decimal("0.3"),
        available_from=date.today()
    )
    location = PropertyLocation(
        property_id=1,
        city_id=1,
        district_id=1,
        commune_id=1,
        street_number="123 Test St",
        latitude=Decimal("21.0"),
        longitude=Decimal("105.0")
    )
    wishlist = WishList(user_id=1, property_id=1)
    db_session.add_all([property, pricing, location, wishlist])
    db_session.commit()

    response = client.post("/api/properties/compare", json={"property_ids": [
                           1]}, headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 200
    assert len(response.json()["properties"]) == 1

def test_get_my_property_listings_api(client, db_session, setup_common_data, mock_current_user):
    category = db_session.get(PropertyCategory, 1)
    assert category is not None

    property = Property(
        property_id=1,
        title="Test Property",
        user_id=1,
        category_id=1,
        status=PropertyStatusEnum.available,
        listed_at=datetime.now(),
        updated_at=datetime.now(),
        bedrooms=2,
        bathrooms=1,
        land_area=Decimal("100.0"),
        floor_area=Decimal("80.0"),
        description="Test Description"
    )

    pricing = PropertyPricing(
        property_id=1,
        rent_price=Decimal("1000.0"),
        electricity_price=Decimal("0.5"),
        water_price=Decimal("0.3"),
        available_from=date.today()
    )

    location = PropertyLocation(
        property_id=1,
        city_id=1,
        district_id=1,
        commune_id=1,
        street_number="123 Test St",
        latitude=Decimal("21.0"),
        longitude=Decimal("105.0")
    )

    db_session.add_all([property, pricing, location])
    db_session.commit()

    response = client.get("/api/properties/my-listings",
                          headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 200

def test_get_cities_api(client, db_session, setup_common_data):
    response = client.get("/api/properties/filters/cities")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["city_name"] == "Hanoi"

def test_get_districts_api(client, db_session, setup_common_data):
    response = client.get("/api/properties/filters/districts?city_id=1")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["district_name"] == "Ba Dinh"

def test_get_communes_api(client, db_session, setup_common_data):
    response = client.get("/api/properties/filters/communes?district_id=1")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["commune_name"] == "Ngoc Ha"

def test_get_categories_api(client, db_session, setup_common_data):
    response = client.get("/api/properties/filters/categories")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["category_name"] == "Apartment"