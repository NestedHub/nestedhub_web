import pytest
from sqlmodel import Session, SQLModel, create_engine, select
from sqlalchemy.pool import StaticPool
from sqlalchemy.exc import IntegrityError
from app.api.deps import get_db_session, get_current_user
from app.models.models import User, Property, PropertyCategory, City, District, Commune, PropertyPricing, PropertyLocation, PropertyMedia, Feature, PropertyFeature, WishList
from app.models.enums import UserRole, PropertyStatusEnum, MediaType
from app.models.property_schemas import PropertyCreate, PropertyUpdate, PropertyRead, PropertyPricingCreate, PropertyLocationCreate, PropertyMediaCreate
from app.crud.crud_property import (
    create_property,
    update_property,
    delete_property,
    get_property_detail_by_id,
    get_property_media_by_id,
    get_property_feature_with_id,
    get_property_pricing_by_id,
    get_property_locations_by_id,
    search_properties,
    get_properties_for_comparison,
    get_owner_properties
)
from fastapi import HTTPException
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

# Test CRUD functions
def test_create_property(db_session, test_user, setup_common_data):
    property_data = PropertyCreate(
        title="Test Property",
        description="Test Description",
        bedrooms=2,
        bathrooms=1,
        land_area=Decimal("100.0"),
        floor_area=Decimal("80.0"),
        status=PropertyStatusEnum.available,
        category_id=1,
        pricing=PropertyPricingCreate(
            rent_price=Decimal("1000.0"),
            electricity_price=Decimal("0.5"),
            water_price=Decimal("0.3"),
            available_from=date.today()
        ),
        location=PropertyLocationCreate(
            city_id=1,
            district_id=1,
            commune_id=1,
            street_number="123 Test St",
            latitude=Decimal("21.0"),
            longitude=Decimal("105.0")
        ),
        media=[PropertyMediaCreate(
            media_url="https://test.com/image.jpg", media_type=MediaType.image)],
        feature_ids=[1]
    )

    result = create_property(
        session=db_session,
        property_data=property_data,
        current_user=test_user
    )

    assert isinstance(result, PropertyRead)
    assert result.title == "Test Property"
    assert result.pricing.rent_price == Decimal("1000.0")
    assert result.location.city_id == 1
    assert len(result.media) == 1
    assert len(result.features) == 1
    db_session.commit()

def test_create_property_unauthorized(db_session, test_user, setup_common_data):
    test_user.role = UserRole.customer
    db_session.add(test_user)
    db_session.commit()

    property_data = PropertyCreate(
        title="Test Property",
        description="Test Description",
        bedrooms=2,
        bathrooms=1,
        land_area=Decimal("100.0"),
        floor_area=Decimal("80.0"),
        status=PropertyStatusEnum.available,
        category_id=1,
        pricing=PropertyPricingCreate(
            rent_price=Decimal("1000.0"),
            electricity_price=Decimal("0.5"),
            water_price=Decimal("0.3"),
            available_from=date.today()
        ),
        location=PropertyLocationCreate(
            city_id=1,
            district_id=1,
            commune_id=1,
            street_number="123 Test St",
            latitude=Decimal("21.0"),
            longitude=Decimal("105.0")
        ),
        media=[],
        feature_ids=[]
    )

    with pytest.raises(HTTPException) as exc:
        create_property(
            session=db_session,
            property_data=property_data,
            current_user=test_user
        )
    assert exc.value.status_code == 403
    db_session.commit()

def test_update_property(db_session, test_user, setup_common_data):
    category = db_session.get(PropertyCategory, 1)
    assert category is not None, f"PropertyCategory not found: {category}"

    property = Property(
        property_id=1,
        title="Old Property",
        user_id=test_user.user_id,
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
    try:
        db_session.add_all([property, pricing, location])
        db_session.flush()
        db_session.commit()
        db_session.refresh(property)
    except IntegrityError as e:
        print(f"IntegrityError in test_update_property: {e}")
        raise

    update_data = PropertyUpdate(
        title="Updated Property",
        pricing=PropertyPricingCreate(rent_price=Decimal("1500.0"))
    )

    result = update_property(
        session=db_session,
        property_id=1,
        property_data=update_data,
        current_user=test_user
    )

    assert result.title == "Updated Property"
    assert result.pricing.rent_price == Decimal("1500.0")
    db_session.commit()

def test_delete_property(db_session, test_user, setup_common_data):
    property = Property(
        property_id=1,
        title="Test Property",
        user_id=test_user.user_id,
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

    delete_property(
        session=db_session,
        property_id=1,
        current_user=test_user
    )

    assert db_session.get(Property, 1) is None
    db_session.commit()

def test_get_property_detail_by_id(db_session, test_user, setup_common_data):
    property = Property(
        property_id=1,
        title="Test Property",
        user_id=test_user.user_id,
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
    media = PropertyMedia(
        property_id=1,
        media_url="https://test.com/image.jpg",
        media_type=MediaType.image
    )
    property_feature = PropertyFeature(property_id=1, feature_id=1)
    db_session.add_all([property, pricing, location, media, property_feature])
    db_session.commit()

    result = get_property_detail_by_id(
        session=db_session,
        property_id=1,
        current_user=None
    )

    assert result.property_id == 1
    assert result.title == "Test Property"
    assert len(result.media) == 1
    assert len(result.features) == 1
    assert result.location.city_name == "Hanoi"
    db_session.commit()

def test_get_property_media_by_id(db_session, setup_common_data):
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
    media = PropertyMedia(
        property_id=1,
        media_url="https://test.com/image.jpg",
        media_type=MediaType.image
    )
    db_session.add_all([property, media])
    db_session.commit()

    result = get_property_media_by_id(session=db_session, property_id=1)
    assert len(result) == 1
    assert result[0].media_url == "https://test.com/image.jpg"
    db_session.commit()

def test_get_property_feature_with_id(db_session, setup_common_data):
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
    property_feature = PropertyFeature(property_id=1, feature_id=1)
    db_session.add_all([property, property_feature])
    db_session.commit()

    result = get_property_feature_with_id(session=db_session, property_id=1)
    assert len(result) == 1
    assert result[0].feature_name == "Parking"
    db_session.commit()

def test_get_property_pricing_by_id(db_session, setup_common_data):
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
    db_session.add_all([property, pricing])
    db_session.commit()

    result = get_property_pricing_by_id(session=db_session, property_id=1)
    assert result.rent_price == Decimal("1000.0")
    db_session.commit()

def test_get_property_locations_by_id(db_session, setup_common_data):
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
    db_session.add_all([property, location])
    db_session.commit()

    result = get_property_locations_by_id(session=db_session, property_id=1)
    assert len(result) == 1
    assert result[0].city_name == "Hanoi"
    db_session.commit()

def test_search_properties(db_session, setup_common_data):
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

    result = search_properties(
        session=db_session,
        keyword="Test",
        city_id=1,
        offset=0,
        limit=10
    )

    assert result.total == 1
    assert len(result.properties) == 1
    assert result.properties[0].title == "Test Property"
    db_session.commit()

def test_get_properties_for_comparison(db_session, test_user, setup_common_data):
    property = Property(
        property_id=1,
        title="Test Property",
        user_id=test_user.user_id,
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
    wishlist = WishList(user_id=test_user.user_id, property_id=1)
    db_session.add_all([property, pricing, location, wishlist])
    db_session.commit()

    result = get_properties_for_comparison(
        session=db_session,
        property_ids=[1],
        user_id=test_user.user_id
    )

    assert len(result) == 1
    assert result[0].title == "Test Property"
    db_session.commit()

def test_get_owner_properties(db_session, test_user, setup_common_data):
    property = Property(
        property_id=1,
        title="Test Property",
        user_id=test_user.user_id,
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

    result = get_owner_properties(session=db_session, user=test_user)
    assert len(result) == 1
    assert result[0].title == "Test Property"
    db_session.commit()