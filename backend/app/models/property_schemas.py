from datetime import datetime, date
from typing import Optional, List
from sqlmodel import SQLModel, Field
from enum import Enum
from decimal import Decimal
from pydantic import BaseModel, field_validator
from app.models.enums import OAuthProvider, UserRole, PropertyStatusEnum, MediaType, ViewingRequestStatusEnum


class CityResponse(BaseModel):
    city_id: int
    city_name: str

    class Config:
        from_attributes = True


class DistrictResponse(BaseModel):
    district_id: int
    district_name: str

    class Config:
        from_attributes = True


class CommuneResponse(BaseModel):
    commune_id: int
    commune_name: str

    class Config:
        from_attributes = True


class CategoryResponse(BaseModel):
    category_id: int
    category_name: str

    class Config:
        from_attributes = True


class PropertyOwnerListing(BaseModel):
    property_id: int
    title: str
    category: str  # PropertyCategory.category_name
    status: PropertyStatusEnum
    date_listed: datetime


class PropertyOwnerListingsResponse(BaseModel):
    properties: List[PropertyOwnerListing]


class PropertyComparisonRequest(BaseModel):
    property_ids: List[int]


class PropertyComparisonItem(BaseModel):
    property_id: int
    title: str
    rent_price: Decimal
    city_name: str
    district_name: str
    bedrooms: int
    bathrooms: int
    floor_area: Decimal
    features: List[str]
    media_url: Optional[str] = None  # First image, if available
    status: PropertyStatusEnum


class PropertyComparisonResponse(BaseModel):
    properties: List[PropertyComparisonItem]


class PropertyPricingCreate(SQLModel):
    """Schema for creating property pricing."""
    rent_price: Decimal
    electricity_price: Optional[Decimal] = None
    water_price: Optional[Decimal] = None
    other_price: Optional[Decimal] = None
    available_from: Optional[date] = None

    @field_validator("rent_price")
    def validate_rent_price(cls, value):
        if value <= 0:
            raise ValueError("Rent price must be positive")
        return value


class PropertyMediaCreate(SQLModel):
    """Schema for creating property media."""
    media_url: str
    media_type: MediaType

    @field_validator("media_url")
    def validate_media_url(cls, value):
        if not value.startswith(("http://", "https://")):
            raise ValueError("Media URL must be a valid HTTP/HTTPS URL")
        return value


class PropertyLocationCreate(SQLModel):
    """Schema for creating property location."""
    city_id: int
    district_id: int
    commune_id: int
    street_number: Optional[str] = None
    latitude: Decimal
    longitude: Decimal

    @field_validator("latitude")
    def validate_latitude(cls, value):
        if not -90 <= float(value) <= 90:
            raise ValueError("Latitude must be between -90 and 90")
        return value

    @field_validator("longitude")
    def validate_longitude(cls, value):
        if not -180 <= float(value) <= 180:
            raise ValueError("Longitude must be between -180 and 180")
        return value


class PropertyCreate(SQLModel):
    """Schema for creating a new property via API."""
    title: str
    description: Optional[str] = None
    bedrooms: int
    bathrooms: int
    land_area: Decimal
    floor_area: Decimal
    status: PropertyStatusEnum = PropertyStatusEnum.available
    category_id: int
    pricing: PropertyPricingCreate
    location: PropertyLocationCreate
    media: List[PropertyMediaCreate] = []
    feature_ids: List[int] = []

    @field_validator("title")
    def validate_title(cls, value):
        if len(value.strip()) < 3:
            raise ValueError("Title must be at least 3 characters long")
        return value

    @field_validator("bedrooms", "bathrooms")
    def validate_non_negative(cls, value):
        if value < 0:
            raise ValueError("Value must be non-negative")
        return value

    @field_validator("land_area", "floor_area")
    def validate_positive_area(cls, value):
        if value <= 0:
            raise ValueError("Area must be positive")
        return value


class PropertyUpdate(SQLModel):
    """Schema for updating a property via API."""
    title: Optional[str] = None
    description: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    land_area: Optional[Decimal] = None
    floor_area: Optional[Decimal] = None
    status: Optional[PropertyStatusEnum] = None
    category_id: Optional[int] = None
    pricing: Optional[PropertyPricingCreate] = None
    location: Optional[PropertyLocationCreate] = None
    media: Optional[List[PropertyMediaCreate]] = None
    feature_ids: Optional[List[int]] = None

    @field_validator("title")
    def validate_title(cls, value):
        if value is not None and len(value.strip()) < 3:
            raise ValueError("Title must be at least 3 characters long")
        return value

    @field_validator("bedrooms", "bathrooms")
    def validate_non_negative(cls, value):
        if value is not None and value < 0:
            raise ValueError("Value must be non-negative")
        return value

    @field_validator("land_area", "floor_area")
    def validate_positive_area(cls, value):
        if value is not None and value <= 0:
            raise ValueError("Area must be positive")
        return value


class PropertyPricingRead(SQLModel):
    rent_price: Decimal
    electricity_price: Optional[Decimal] = None
    water_price: Optional[Decimal] = None
    other_price: Optional[Decimal] = None
    available_from: Optional[date] = None


class PropertyMediaRead(SQLModel):
    media_url: str
    media_type: MediaType


class FeatureRead(SQLModel):
    feature_id: int
    feature_name: str


class PropertyLocationRead(SQLModel):
    location_id: int
    property_id: int
    city_id: Optional[int] = None
    district_id: Optional[int] = None
    commune_id: Optional[int] = None
    street_number: Optional[str] = None
    latitude: Decimal
    longitude: Decimal
    city_name: Optional[str] = None
    district_name: Optional[str] = None
    commune_name: Optional[str] = None


class PropertyRead(SQLModel):
    """Schema for reading a property via API."""
    property_id: int
    title: str
    description: Optional[str] = None
    bedrooms: int
    bathrooms: int
    land_area: Decimal
    floor_area: Decimal
    status: PropertyStatusEnum
    updated_at: datetime
    listed_at: datetime
    user_id: Optional[int] = None
    category_name: Optional[str] = None
    rating: Optional[Decimal] = None
    pricing: Optional[PropertyPricingRead] = None
    location: Optional[PropertyLocationRead] = None
    media: List[PropertyMediaRead] = []
    features: List[FeatureRead] = []


class PaginatedPropertyRead(BaseModel):
    total: int
    properties: List[PropertyRead]

class FeatureResponse(BaseModel):
    feature_id: int
    feature_name: str