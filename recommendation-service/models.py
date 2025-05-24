from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Integer, Text, CheckConstraint, Numeric, String, ForeignKey
from sqlmodel import SQLModel, Field, Relationship
from decimal import Decimal
from typing import Optional, List
from enums import PropertyStatusEnum, ReviewStatusEnum, ViewingRequestStatusEnum


class PropertyFeature(SQLModel, table=True):
    property_id: int = Field(sa_column=Column(Integer, ForeignKey(
        "property.property_id", ondelete="CASCADE"), primary_key=True))
    feature_id: int = Field(sa_column=Column(Integer, ForeignKey(
        "feature.feature_id", ondelete="CASCADE"), primary_key=True))

class User(SQLModel, table=True):
    user_id: Optional[int] = Field(default=None, primary_key=True)
    wishlist_items: List["WishList"] = Relationship(back_populates="user")
    property_views: List["PropertyView"] = Relationship(back_populates="user")
    reviews: List["Review"] = Relationship(back_populates="user")
    viewing_requests: List["ViewingRequest"] = Relationship(
        back_populates="user")


class Property(SQLModel, table=True):
    property_id: Optional[int] = Field(default=None, primary_key=True)
    description: str = Field(sa_column=Column(String))
    bedrooms: int = Field(default=0)
    bathrooms: int = Field(default=0)
    land_area: Decimal = Field(default=Decimal(
        "0.00"), sa_column=Column(Numeric(10, 2)))
    floor_area: Decimal = Field(default=Decimal(
        "0.00"), sa_column=Column(Numeric(10, 2)))
    status: PropertyStatusEnum = Field(default=PropertyStatusEnum.available)
    pricing: Optional["PropertyPricing"] = Relationship(
        back_populates="property", sa_relationship_kwargs={"uselist": False}
    )
    property_location: Optional["PropertyLocation"] = Relationship(
        back_populates="property", sa_relationship_kwargs={"uselist": False})
    features: List["Feature"] = Relationship(
        back_populates="properties", link_model=PropertyFeature)
    wishlisted_by: List["WishList"] = Relationship(back_populates="property")
    views: List["PropertyView"] = Relationship(back_populates="property")
    reviews: List["Review"] = Relationship(back_populates="property")
    viewing_requests: List["ViewingRequest"] = Relationship(
        back_populates="property")


class PropertyPricing(SQLModel, table=True):
    pricing_id: Optional[int] = Field(default=None, primary_key=True)
    property_id: int = Field(sa_column=Column(Integer, ForeignKey(
        "property.property_id", ondelete="CASCADE"), unique=True))
    rent_price: Decimal = Field(sa_column=Column(Numeric(10, 2)))
    property: Optional["Property"] = Relationship(back_populates="pricing")


class WishList(SQLModel, table=True):
    user_id: int = Field(sa_column=Column(Integer, ForeignKey(
        "user.user_id"), primary_key=True, index=True))
    property_id: int = Field(sa_column=Column(Integer, ForeignKey(
        "property.property_id", ondelete="CASCADE"), primary_key=True, index=True))
    added_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    user: Optional["User"] = Relationship(back_populates="wishlist_items")
    property: Optional["Property"] = Relationship(
        back_populates="wishlisted_by")


class PropertyView(SQLModel, table=True):
    view_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(sa_column=Column(
        Integer, ForeignKey("user.user_id"), index=True))
    property_id: int = Field(sa_column=Column(Integer, ForeignKey(
        "property.property_id", ondelete="CASCADE"), index=True))
    viewed_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    user: Optional["User"] = Relationship(back_populates="property_views")
    property: Optional["Property"] = Relationship(back_populates="views")


class Review(SQLModel, table=True):
    review_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(sa_column=Column(
        Integer, ForeignKey("user.user_id"), index=True))
    property_id: int = Field(sa_column=Column(Integer, ForeignKey(
        "property.property_id", ondelete="CASCADE"), index=True))
    rating: int = Field(sa_column=Column(
        Integer, CheckConstraint('rating >= 1 AND rating <= 5')))
    comment: Optional[str] = Field(default=None, sa_column=Column(Text))
    status: ReviewStatusEnum = Field(default=ReviewStatusEnum.pending)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    user: Optional["User"] = Relationship(back_populates="reviews")
    property: Optional["Property"] = Relationship(back_populates="reviews")


class ViewingRequest(SQLModel, table=True):
    request_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(sa_column=Column(
        Integer, ForeignKey("user.user_id"), index=True))
    property_id: int = Field(sa_column=Column(Integer, ForeignKey(
        "property.property_id", ondelete="CASCADE"), index=True))
    requested_time: datetime = Field()
    status: ViewingRequestStatusEnum = Field(
        default=ViewingRequestStatusEnum.pending)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    user: Optional["User"] = Relationship(back_populates="viewing_requests")
    property: Optional["Property"] = Relationship(
        back_populates="viewing_requests")


class Feature(SQLModel, table=True):
    feature_id: Optional[int] = Field(default=None, primary_key=True)
    feature_name: str = Field(sa_column=Column(String, unique=True))
    properties: List["Property"] = Relationship(
        back_populates="features", link_model=PropertyFeature)



class PropertyLocation(SQLModel, table=True):
    property_id: int = Field(sa_column=Column(Integer, ForeignKey(
        "property.property_id", ondelete="CASCADE"), primary_key=True))
    city_id: int = Field(index=True)
    latitude: Optional[float] = Field(default=None)
    longitude: Optional[float] = Field(default=None)
    property: Optional["Property"] = Relationship(
        back_populates="property_location")
