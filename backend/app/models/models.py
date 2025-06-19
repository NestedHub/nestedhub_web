from datetime import datetime, date
from sqlalchemy import Column, DateTime, Integer, Text, CheckConstraint, Numeric, String, text, func, UniqueConstraint
from sqlmodel import SQLModel, Field, Relationship
from decimal import Decimal
from datetime import timezone
from typing import Optional, List
from app.models.enums import OAuthProvider, UserRole, PropertyStatusEnum, MediaType, ViewingRequestStatusEnum, ReviewStatusEnum


class VerificationCodeDB(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True)
    code: str = Field(max_length=6)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime = Field()


class RevokedToken(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    token: str = Field(index=True)
    expires_at: datetime = Field(sa_column=Column(DateTime(timezone=True)))
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True))
    )


class User(SQLModel, table=True):
    user_id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(..., max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20, unique=True)
    email: str = Field(..., max_length=255, unique=True)
    hashed_password: Optional[str] = Field(default=None, max_length=255)
    oauth_provider: OAuthProvider = Field(default=OAuthProvider.none)
    oauth_uid: Optional[str] = Field(default=None, max_length=255, unique=True)
    profile_picture_url: Optional[str] = Field(default=None, max_length=255)
    id_card_url: Optional[str] = Field(
        default=None, max_length=255, description="URL to property owner's ID card, required for property owners")

    role: UserRole = Field(default=UserRole.customer, index=True)
    is_email_verified: bool = Field(default=False)
    is_approved: bool = Field(default=False, index=True)
    is_active: bool = Field(default=True)

    # Python-side created_at
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # DB-side updated_at
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("CURRENT_TIMESTAMP"),
            onupdate=func.current_timestamp(),
        )
    )

    # Relationships
    properties: List["Property"] = Relationship(back_populates="user")
    wishlist_items: List["WishList"] = Relationship(back_populates="user")
    property_views: List["PropertyView"] = Relationship(back_populates="user")
    reviews: List["Review"] = Relationship(back_populates="user")
    viewing_requests: List["ViewingRequest"] = Relationship(
        back_populates="user")


class PropertyCategory(SQLModel, table=True):
    category_id: Optional[int] = Field(default=None, primary_key=True)
    category_name: str = Field(..., max_length=255)
    properties: List["Property"] = Relationship(
        back_populates="property_category")


class PropertyMedia(SQLModel, table=True):
    media_id: Optional[int] = Field(default=None, primary_key=True)
    property_id: int = Field(
        foreign_key="property.property_id", ondelete="CASCADE")
    media_url: str = Field(..., max_length=255)
    media_type: MediaType = Field(...)
    property: "Property" = Relationship(back_populates="property_medias")


class PropertyPricing(SQLModel, table=True):
    pricing_id: Optional[int] = Field(default=None, primary_key=True)
    property_id: int = Field(
        foreign_key="property.property_id", unique=True, ondelete="CASCADE")
    rent_price: Decimal = Field(..., sa_column=Column(Numeric(10, 2)))
    electricity_price: Optional[Decimal] = Field(
        default=None, sa_column=Column(Numeric(10, 2)))
    water_price: Optional[Decimal] = Field(
        default=None, sa_column=Column(Numeric(10, 2)))
    other_price: Optional[Decimal] = Field(
        default=None, sa_column=Column(Numeric(10, 2)))
    available_from: Optional[date] = Field(default=None)
    property: "Property" = Relationship(back_populates="pricing")


class PropertyLocation(SQLModel, table=True):
    location_id: Optional[int] = Field(default=None, primary_key=True)
    property_id: int = Field(
        foreign_key="property.property_id", unique=True, ondelete="CASCADE")
    city_id: int = Field(foreign_key="city.city_id")
    district_id: int = Field(foreign_key="district.district_id")
    commune_id: int = Field(foreign_key="commune.commune_id")
    street_number: Optional[str] = Field(default=None, max_length=255)
    latitude: Decimal = Field(sa_column=Column(Numeric(9, 6)))
    longitude: Decimal = Field(sa_column=Column(Numeric(9, 6)))
    property: "Property" = Relationship(back_populates="property_location")


class City(SQLModel, table=True):
    city_id: Optional[int] = Field(default=None, primary_key=True)
    city_name: str = Field(..., max_length=255)
    districts: List["District"] = Relationship(back_populates="city")


class District(SQLModel, table=True):
    district_id: Optional[int] = Field(default=None, primary_key=True)
    city_id: int = Field(default=None, foreign_key="city.city_id")
    district_name: str = Field(..., max_length=255)
    city: "City" = Relationship(back_populates="districts")
    communes: List["Commune"] = Relationship(back_populates="district")


class Commune(SQLModel, table=True):
    commune_id: Optional[int] = Field(default=None, primary_key=True)
    district_id: int = Field(default=None, foreign_key="district.district_id")
    commune_name: str = Field(..., max_length=255)
    district: "District" = Relationship(back_populates="communes")


class PropertyFeature(SQLModel, table=True):
    property_id: int = Field(
        foreign_key="property.property_id", primary_key=True, ondelete="CASCADE")
    feature_id: int = Field(foreign_key="feature.feature_id", primary_key=True)
    __table_args__ = (UniqueConstraint(
        "property_id", "feature_id", name="uq_property_feature"),)


class Feature(SQLModel, table=True):
    feature_id: int = Field(default=None, primary_key=True)
    feature_name: str = Field(..., max_length=255)
    properties: List["Property"] = Relationship(
        back_populates="features", link_model=PropertyFeature)


class Property(SQLModel, table=True):
    property_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(
        default=None, foreign_key="user.user_id", index=True, ondelete="CASCADE")
    category_id: int = Field(foreign_key="propertycategory.category_id")
    title: str = Field(..., max_length=255)
    description: str = Field(sa_column=Column(String))
    bedrooms: int = Field(default=0)
    bathrooms: int = Field(default=0)
    land_area: Decimal = Field(default=Decimal(
        "0.00"), sa_column=Column(Numeric(10, 2)))
    floor_area: Decimal = Field(default=Decimal(
        "0.00"), sa_column=Column(Numeric(10, 2)))
    status: PropertyStatusEnum = Field(default=PropertyStatusEnum.available)
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), server_default=text(
            "CURRENT_TIMESTAMP"), onupdate=func.current_timestamp())
    )
    listed_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True),
                         server_default=text("CURRENT_TIMESTAMP"))
    )
    rating: Optional[Decimal] = Field(default=None, sa_column=Column(
        Numeric(4, 2)), description="Bayesian average rating based on reviews")
    user: "User" = Relationship(back_populates="properties")
    property_category: "PropertyCategory" = Relationship(
        back_populates="properties")
    property_location: "PropertyLocation" = Relationship(
        back_populates="property")
    features: List["Feature"] = Relationship(
        back_populates="properties", link_model=PropertyFeature)
    pricing: "PropertyPricing" = Relationship(
        back_populates="property")
    property_medias: List["PropertyMedia"] = Relationship(
        back_populates="property")
    wishlisted_by: List["WishList"] = Relationship(back_populates="property")
    views: List["PropertyView"] = Relationship(back_populates="property")
    reviews: List["Review"] = Relationship(back_populates="property")
    viewing_requests: List["ViewingRequest"] = Relationship(
        back_populates="property")


class WishList(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.user_id",
                         primary_key=True, index=True)
    property_id: int = Field(
        foreign_key="property.property_id", primary_key=True, index=True, ondelete="CASCADE")
    added_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    user: "User" = Relationship(back_populates="wishlist_items")
    property: "Property" = Relationship(back_populates="wishlisted_by")


class ViewingRequest(SQLModel, table=True):
    request_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.user_id", index=True)
    property_id: int = Field(
        foreign_key="property.property_id", index=True, ondelete="CASCADE")
    requested_time: datetime = Field(...)
    status: ViewingRequestStatusEnum = Field(
        default=ViewingRequestStatusEnum.pending)
    # Added message column
    message: Optional[str] = Field(default=None, sa_column=Column(
        Text), description="Optional message from the user regarding the viewing request")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    user: "User" = Relationship(back_populates="viewing_requests")
    property: "Property" = Relationship(back_populates="viewing_requests")


class Review(SQLModel, table=True):
    review_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.user_id", index=True)
    property_id: int = Field(
        foreign_key="property.property_id", index=True, ondelete="CASCADE")
    rating: int = Field(..., sa_column=Column(
        Integer, CheckConstraint('rating >= 1 AND rating <= 5')))
    comment: Optional[str] = Field(default=None, sa_column=Column(Text))
    status: ReviewStatusEnum = Field(default=ReviewStatusEnum.pending)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), sa_column=Column(
        DateTime, server_default=text("CURRENT_TIMESTAMP")))
    user: "User" = Relationship(back_populates="reviews")
    property: "Property" = Relationship(back_populates="reviews")


class PropertyView(SQLModel, table=True):
    view_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.user_id", index=True)
    property_id: int = Field(
        foreign_key="property.property_id", index=True, ondelete="CASCADE")
    viewed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), sa_column=Column(
        DateTime, server_default=text("CURRENT_TIMESTAMP")))
    user: "User" = Relationship(back_populates="property_views")
    property: "Property" = Relationship(back_populates="views")


# ---------------------
# OPTIONAL TRACKING TABLES
# Uncomment these if you decide to track more detailed user interactions.
# ---------------------

# class PropertyHover(SQLModel, table=True):
#     hover_id: Optional[int] = Field(default=None, primary_key=True)
#     user_id: int = Field(foreign_key="user.user_id", nullable=True)
#     property_id: int = Field(
#         foreign_key="property.property_id", ondelete="CASCADE")
#     hovered_at: datetime = Field(
#         default_factory=lambda: datetime.now(timezone.utc))
#     duration: int = Field(..., description="Duration in milliseconds")

#     user: "User" = Relationship(back_populates="property_hovers")
#     property: "Property" = Relationship(back_populates="hovers")


# class SearchQuery(SQLModel, table=True):
#     query_id: Optional[int] = Field(default=None, primary_key=True)
#     user_id: int = Field(foreign_key="user.user_id", nullable=True)
#     query_text: str = Field(..., max_length=255)
#     filters: Optional[str] = Field(default=None, max_length=500)
#     searched_at: datetime = Field(
#         default_factory=lambda: datetime.now(timezone.utc))

#     user: "User" = Relationship(back_populates="search_queries")


# class PropertyTimeSpent(SQLModel, table=True):
#     time_spent_id: Optional[int] = Field(default=None, primary_key=True)
#     user_id: int = Field(foreign_key="user.user_id", nullable=True)
#     property_id: int = Field(
#         foreign_key="property.property_id", ondelete="CASCADE")
#     entered_at: datetime = Field(
#         default_factory=lambda: datetime.now(timezone.utc))
#     duration: int = Field(..., description="Time spent in milliseconds")

#     user: "User" = Relationship(back_populates="time_spent_records")
#     property: "Property" = Relationship(back_populates="time_spent_records")
