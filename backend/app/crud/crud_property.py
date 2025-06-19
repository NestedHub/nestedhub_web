import logging
from decimal import Decimal
from sqlmodel import Session, select, func
from collections import defaultdict
from app.models.enums import UserRole, PropertyStatusEnum
from app.models.property_schemas import (
    PropertyCreate, PropertyRead, PropertyUpdate,
    PropertyPricingRead, PropertyMediaRead, PropertyLocationRead, FeatureRead,
    PaginatedPropertyRead, PropertyComparisonItem, PropertyOwnerListing, PropertyStatsResponse, PropertyCountResponse
)
from app.models.models import (
    Property, User, PropertyPricing, PropertyMedia, PropertyLocation,
    PropertyCategory, City, District, Commune, Feature, PropertyFeature, WishList
)
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import joinedload, selectinload
from typing import Optional, List

logger = logging.getLogger(__name__)


def get_related_properties(
    *,
    session: Session,
    property_id: int,
    limit: int = 6
) -> List[PropertyRead]:
    """
    Fetch properties related to the given property ID based on city and category.

    Args:
        session: SQLModel database session.
        property_id: ID of the target property.
        limit: Maximum number of related properties to return.

    Returns:
        List of PropertyRead objects for related properties.

    Raises:
        HTTPException: If the target property is not found or database error occurs.
    """
    try:
        # Fetch target property with necessary relationships
        target_property = session.exec(
            select(Property)
            .where(Property.property_id == property_id)
            .options(
                joinedload(Property.property_location),
                joinedload(Property.property_category)
            )
        ).first()

        if not target_property:
            raise HTTPException(
                status_code=404, detail=f"Property with ID {property_id} not found")

        # Extract attributes for matching
        city_id = target_property.property_location.city_id
        category_id = target_property.category_id

        # Log target property details
        logger.debug(
            "Target property: ID=%s, city_id=%s, category_id=%s",
            property_id, city_id, category_id
        )

        # Build query for related properties
        statement = (
            select(Property)
            .join(PropertyLocation)
            .where(Property.property_id != property_id)  # Exclude target property
            .where(PropertyLocation.city_id == city_id)
            .where(Property.category_id == category_id)
            .where(Property.status == PropertyStatusEnum.available)
            .options(
                selectinload(Property.property_location),
                selectinload(Property.pricing),
                selectinload(Property.features),
                selectinload(Property.property_medias),
                joinedload(Property.property_category)
            )
            .order_by(Property.listed_at.desc())  # Most recent first
            .limit(limit)
        )

        properties = session.exec(statement).all()
        logger.debug("Query returned %d properties", len(properties))

        # Convert to PropertyRead objects
        property_reads = []
        for p in properties:
            try:
                location = p.property_location
                city = session.exec(select(City).where(
                    City.city_id == location.city_id)).first() if location else None
                district = session.exec(select(District).where(
                    District.district_id == location.district_id)).first() if location else None
                commune = session.exec(select(Commune).where(
                    Commune.commune_id == location.commune_id)).first() if location else None

                location_read = None
                if location:
                    location_read = PropertyLocationRead(
                        location_id=location.location_id,
                        property_id=location.property_id,
                        city_id=location.city_id,
                        district_id=location.district_id,
                        commune_id=location.commune_id,
                        street_number=location.street_number,
                        latitude=location.latitude,
                        longitude=location.longitude,
                        city_name=city.city_name if city else "Unknown",
                        district_name=district.district_name if district else "Unknown",
                        commune_name=commune.commune_name if commune else "Unknown"
                    )

                property_read = PropertyRead(
                    property_id=p.property_id,
                    title=p.title,
                    description=p.description,
                    bedrooms=p.bedrooms,
                    bathrooms=p.bathrooms,
                    land_area=p.land_area,
                    floor_area=p.floor_area,
                    status=p.status,
                    updated_at=p.updated_at,
                    listed_at=p.listed_at,
                    user_id=p.user_id,
                    category_name=p.property_category.category_name if p.property_category else None,
                    rating=p.rating,
                    pricing=PropertyPricingRead.model_validate(
                        p.pricing) if p.pricing else None,
                    location=location_read,
                    media=[PropertyMediaRead.model_validate(
                        m) for m in p.property_medias] if hasattr(p, "property_medias") else [],
                    features=[FeatureRead.model_validate(
                        f) for f in p.features] if hasattr(p, "features") else []
                )
                property_reads.append(property_read)
            except Exception as e:
                logger.warning(f"Error processing property {p.property_id}: {e}")
                continue

        logger.debug("Returning %d related properties", len(property_reads))
        return property_reads

    except SQLAlchemyError as e:
        logger.error(f"Database error in get_related_properties: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in get_related_properties: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Unexpected error occurred")

def create_property(
    *,
    session: Session,
    property_data: PropertyCreate,
    current_user: User
) -> PropertyRead:
    """
    Create a new property with associated pricing, location, media, and features.

    Args:
        session: SQLModel database session.
        property_data: PropertyCreate object with property details.
        current_user: Authenticated user creating the property.

    Returns:
        PropertyRead object for the created property.

    Raises:
        HTTPException: If the user is not authorized, or if data is invalid.
    """
    if current_user.role not in [UserRole.property_owner, UserRole.admin]:
        raise HTTPException(
            status_code=403,
            detail="Only property owners or admins can create properties")
    if not current_user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    try:
        # Validate foreign keys
        category = session.get(PropertyCategory, property_data.category_id)
        if not category:
            raise HTTPException(
                status_code=404, detail=f"Category with ID {property_data.category_id} not found")
        city = session.get(City, property_data.location.city_id)
        if not city:
            raise HTTPException(
                status_code=404, detail=f"City with ID {property_data.location.city_id} not found")
        district = session.get(District, property_data.location.district_id)
        if not district:
            raise HTTPException(
                status_code=404, detail=f"District with ID {property_data.location.district_id} not found")
        commune = session.get(Commune, property_data.location.commune_id)
        if not commune:
            raise HTTPException(
                status_code=404, detail=f"Commune with ID {property_data.location.commune_id} not found")

        # Create Property
        db_property = Property(
            title=property_data.title,
            description=property_data.description,
            bedrooms=property_data.bedrooms,
            bathrooms=property_data.bathrooms,
            land_area=property_data.land_area,
            floor_area=property_data.floor_area,
            status=property_data.status,
            category_id=property_data.category_id,
            user_id=current_user.user_id
        )
        session.add(db_property)
        session.flush()  # Get property_id

        # Create PropertyPricing
        pricing = PropertyPricing(
            property_id=db_property.property_id,
            rent_price=property_data.pricing.rent_price,
            electricity_price=property_data.pricing.electricity_price,
            water_price=property_data.pricing.water_price,
            other_price=property_data.pricing.other_price,
            available_from=property_data.pricing.available_from
        )
        session.add(pricing)

        # Create PropertyLocation
        location = PropertyLocation(
            property_id=db_property.property_id,
            city_id=property_data.location.city_id,
            district_id=property_data.location.district_id,
            commune_id=property_data.location.commune_id,
            street_number=property_data.location.street_number,
            latitude=property_data.location.latitude,
            longitude=property_data.location.longitude
        )
        session.add(location)

        # Create PropertyMedia
        for media_item in property_data.media:
            media = PropertyMedia(
                property_id=db_property.property_id,
                media_url=media_item.media_url,
                media_type=media_item.media_type
            )
            session.add(media)

        # Create PropertyFeature associations
        feature_ids = property_data.feature_ids
        if feature_ids:
            features = session.exec(select(Feature).where(
                Feature.feature_id.in_(feature_ids))).all()
            if len(features) != len(feature_ids):
                missing_ids = set(feature_ids) - \
                    {f.feature_id for f in features}
                raise HTTPException(
                    status_code=404, detail=f"Features with IDs {missing_ids} not found")
            for feature_id in feature_ids:
                property_feature = PropertyFeature(
                    property_id=db_property.property_id,
                    feature_id=feature_id
                )
                session.add(property_feature)

        session.commit()
        session.refresh(db_property)

        return get_property_detail_by_id(
            session=session,
            property_id=db_property.property_id,
            current_user=current_user
        )
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail="Invalid data (e.g., duplicate location or invalid foreign key)"
        )


def update_property(
    *,
    session: Session,
    property_id: int,
    property_data: PropertyUpdate,
    current_user: User
) -> PropertyRead:
    """
    Update an existing property and its associated data.

    Args:
        session: SQLModel database session.
        property_id: ID of the property to update.
        property_data: PropertyUpdate object with updated fields.
        current_user: Authenticated user updating the property.

    Returns:
        Updated PropertyRead object.

    Raises:
        HTTPException: If the property is not found or user is not authorized.
    """
    property = session.get(Property, property_id)
    if not property:
        raise HTTPException(
            status_code=404, detail=f"Property with ID {property_id} not found")
    if property.user_id != current_user.user_id and current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this property")
    if not current_user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    try:
        # Validate foreign keys if provided
        if "category_id" in property_data.dict(exclude_unset=True):
            category = session.get(PropertyCategory, property_data.category_id)
            if not category:
                raise HTTPException(
                    status_code=404, detail=f"Category with ID {property_data.category_id} not found")
        if property_data.location:
            if "city_id" in property_data.location.dict(exclude_unset=True):
                city = session.get(City, property_data.location.city_id)
                if not city:
                    raise HTTPException(
                        status_code=404, detail=f"City with ID {property_data.location.city_id} not found")
            if "district_id" in property_data.location.dict(exclude_unset=True):
                district = session.get(
                    District, property_data.location.district_id)
                if not district:
                    raise HTTPException(
                        status_code=404, detail=f"District with ID {property_data.location.district_id} not found")
            if "commune_id" in property_data.location.dict(exclude_unset=True):
                commune = session.get(
                    Commune, property_data.location.commune_id)
                if not commune:
                    raise HTTPException(
                        status_code=404, detail=f"Commune with ID {property_data.location.commune_id} not found")

        # Update Property fields
        for field, value in property_data.dict(exclude_unset=True).items():
            if field not in ["pricing", "location", "media", "feature_ids"]:
                setattr(property, field, value)

        # Update PropertyPricing
        if property_data.pricing:
            pricing = session.exec(
                select(PropertyPricing).where(
                    PropertyPricing.property_id == property_id)
            ).first()
            if not pricing:
                raise HTTPException(
                    status_code=500, detail="Pricing record missing for property")
            for field, value in property_data.pricing.dict(exclude_unset=True).items():
                setattr(pricing, field, value)
            session.add(pricing)

        # Update PropertyLocation
        if property_data.location:
            location = session.exec(
                select(PropertyLocation).where(
                    PropertyLocation.property_id == property_id)
            ).first()
            if not location:
                raise HTTPException(
                    status_code=500, detail="Location record missing for property")
            for field, value in property_data.location.dict(exclude_unset=True).items():
                setattr(location, field, value)
            session.add(location)

        # Update PropertyMedia
        if property_data.media is not None:
            session.exec(
                select(PropertyMedia).where(
                    PropertyMedia.property_id == property_id).delete()
            )
            for media_item in property_data.media:
                media = PropertyMedia(
                    property_id=property_id,
                    media_url=media_item.media_url,
                    media_type=media_item.media_type
                )
                session.add(media)

        # Update PropertyFeature
        if property_data.feature_ids is not None:
            session.exec(
                select(PropertyFeature).where(
                    PropertyFeature.property_id == property_id).delete()
            )
            feature_ids = property_data.feature_ids
            if feature_ids:
                features = session.exec(select(Feature).where(
                    Feature.feature_id.in_(feature_ids))).all()
                if len(features) != len(feature_ids):
                    missing_ids = set(feature_ids) - \
                        {f.feature_id for f in features}
                    raise HTTPException(
                        status_code=404, detail=f"Features with IDs {missing_ids} not found")
                for feature_id in feature_ids:
                    property_feature = PropertyFeature(
                        property_id=property_id,
                        feature_id=feature_id
                    )
                    session.add(property_feature)

        session.add(property)
        session.commit()
        session.refresh(property)

        return get_property_detail_by_id(
            session=session,
            property_id=property_id,
            current_user=current_user
        )
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail="Invalid data (e.g., duplicate location or invalid foreign key)"
        )


def delete_property(
    *,
    session: Session,
    property_id: int,
    current_user: User
) -> None:
    """
    Delete a property and its associated data.

    Args:
        session: SQLModel database session.
        property_id: ID of the property to delete.
        current_user: Authenticated user deleting the property.

    Raises:
        HTTPException: If the property is not found or user is not authorized.
    """
    property = session.get(Property, property_id)
    if not property:
        raise HTTPException(
            status_code=404, detail=f"Property with ID {property_id} not found")
    if property.user_id != current_user.user_id and current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this property")
    if not current_user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    logger.info(
        f"Property {property_id} deleted by user {current_user.user_id}")
    session.delete(property)
    session.commit()


def get_property_detail_by_id(
    session: Session,
    property_id: int,
    current_user: Optional[User] = None
) -> PropertyRead:
    # Use selectinload for collections to avoid Cartesian product
    statement = (
        select(Property)
        .where(Property.property_id == property_id)
        .options(
            joinedload(Property.property_category),
            joinedload(Property.pricing),
            joinedload(Property.property_location),
            selectinload(Property.property_medias),
            selectinload(Property.features)
        )
    )
    result = session.exec(statement).unique().first()

    if not result:
        raise HTTPException(status_code=404, detail="Property not found")

    property = result

    # Check required related objects
    if not property.pricing:
        raise HTTPException(status_code=500, detail="Missing pricing")
    if not property.property_location:
        raise HTTPException(status_code=500, detail="Missing location")

    # Check permissions based on status
    # if property.status != PropertyStatusEnum.available:
    #     if not current_user or (property.user_id != current_user.user_id and current_user.role != UserRole.admin):
    #         raise HTTPException(status_code=403, detail="Not authorized")
    #     if not current_user.is_active:
    #         raise HTTPException(status_code=403, detail="Account inactive")

    # Build location response with names using the ids from PropertyLocation
    location = property.property_location
    city = session.exec(select(City).where(
        City.city_id == location.city_id)).first()
    district = session.exec(select(District).where(
        District.district_id == location.district_id)).first()
    commune = session.exec(select(Commune).where(
        Commune.commune_id == location.commune_id)).first()

    location_read = PropertyLocationRead(
        location_id=location.location_id,
        property_id=location.property_id,
        city_id=location.city_id,
        district_id=location.district_id,
        commune_id=location.commune_id,
        street_number=location.street_number,
        latitude=location.latitude,
        longitude=location.longitude,
        city_name=city.city_name if city else "Unknown",
        district_name=district.district_name if district else "Unknown",
        commune_name=commune.commune_name if commune else "Unknown"
    )

    # Convert media and features to schemas
    return PropertyRead(
        property_id=property.property_id,
        title=property.title,
        description=property.description,
        bedrooms=property.bedrooms,
        bathrooms=property.bathrooms,
        land_area=property.land_area,
        floor_area=property.floor_area,
        status=property.status,
        updated_at=property.updated_at,
        listed_at=property.listed_at,
        user_id=property.user_id,
        category_name=property.property_category.category_name,
        rating=property.rating,
        pricing=PropertyPricingRead.model_validate(property.pricing),
        location=location_read,
        media=[PropertyMediaRead.model_validate(
            m) for m in property.property_medias],
        features=[FeatureRead.model_validate(f) for f in property.features]
    )


def get_property_media_by_id(*, session: Session, property_id: int) -> List[PropertyMediaRead]:
    """
    Retrieve media for a property by its ID.

    Args:
        session: SQLModel database session.
        property_id: ID of the property.

    Returns:
        List of PropertyMediaRead objects.

    Raises:
        HTTPException: If the property is not found.
    """
    property = session.get(Property, property_id)
    if not property:
        raise HTTPException(
            status_code=404, detail=f"Property with ID {property_id} not found")
    statement = select(PropertyMedia).where(
        PropertyMedia.property_id == property_id)
    media_objs = session.exec(statement).all()
    return [PropertyMediaRead.model_validate(obj) for obj in media_objs]


def get_property_feature_with_id(*, session: Session, property_id: int) -> List[FeatureRead]:
    """
    Retrieve features for a property by its ID.

    Args:
        session: SQLModel database session.
        property_id: ID of the property.

    Returns:
        List of FeatureRead objects.

    Raises:
        HTTPException: If the property is not found.
    """
    property = session.get(Property, property_id)
    if not property:
        raise HTTPException(
            status_code=404, detail=f"Property with ID {property_id} not found")
    statement = (
        select(Feature)
        .join(PropertyFeature)
        .where(PropertyFeature.property_id == property_id)
    )
    features = session.exec(statement).all()
    return [FeatureRead.model_validate(feature) for feature in features]


def get_property_pricing_by_id(*, session: Session, property_id: int) -> PropertyPricingRead:
    """
    Retrieve pricing information for a property by its ID.

    Args:
        session: SQLModel database session.
        property_id: ID of the property.

    Returns:
        PropertyPricingRead object.

    Raises:
        HTTPException: If the property or pricing is not found.
    """
    property = session.get(Property, property_id)
    if not property:
        raise HTTPException(
            status_code=404, detail=f"Property with ID {property_id} not found")
    statement = select(PropertyPricing).where(
        PropertyPricing.property_id == property_id)
    pricing_obj = session.exec(statement).first()
    if pricing_obj is None:
        raise HTTPException(
            status_code=500, detail="Pricing record missing for property")
    return PropertyPricingRead.model_validate(pricing_obj)


def get_property_locations_by_id(*, session: Session, property_id: Optional[int] = None) -> List[PropertyLocationRead]:
    """
    Retrieve location details for one or more properties.

    This function fetches location records associated with a given property ID.
    If no property_id is provided, it returns locations for all properties.

    Args:
        session (Session): SQLModel database session.
        property_id (Optional[int], optional): ID of the property to filter by. 
            If None, retrieves locations for all properties.

    Returns:
        List[PropertyLocationRead]: A list of property location data including city, 
            district, and commune details.

    Raises:
        HTTPException: 
            - 404 if the specified property ID is not found or has no associated location.
    """
    statement = select(PropertyLocation, City, District, Commune).outerjoin(
        City, PropertyLocation.city_id == City.city_id
    ).outerjoin(
        District, PropertyLocation.district_id == District.district_id
    ).outerjoin(
        Commune, PropertyLocation.commune_id == Commune.commune_id
    )
    if property_id:
        statement = statement.where(
            PropertyLocation.property_id == property_id)
    results = session.exec(statement).all()
    if property_id and not results:
        raise HTTPException(
            status_code=404, detail=f"Property with ID {property_id} not found or has no location")

    property_locations = []
    for location, city, district, commune in results:
        property_locations.append(PropertyLocationRead(
            location_id=location.location_id,
            property_id=location.property_id,
            city_id=location.city_id,
            district_id=location.district_id,
            commune_id=location.commune_id,
            street_number=location.street_number,
            latitude=location.latitude,
            longitude=location.longitude,
            city_name=city.city_name if city else None,
            district_name=district.district_name if district else None,
            commune_name=commune.commune_name if commune else None
        ))
    return property_locations


def search_properties(
    *,
    session: Session,
    keyword: Optional[str] = None,
    city_id: Optional[int] = None,
    district_id: Optional[int] = None,
    commune_id: Optional[int] = None,
    category_id: Optional[int] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = None,
    offset: int = 0,
    limit: int = 10
) -> "PaginatedPropertyRead":  # Use string literal for forward reference
    """
    Search and filter properties by keyword, location, and property type with sorting.
    """
    try:
        valid_sort_fields = {
            'rent_price': PropertyPricing.rent_price,
            'bedrooms': Property.bedrooms,
            'floor_area': Property.floor_area,
            'listed_at': Property.listed_at
        }

        # Start with selecting Property, and potentially the sort column
        # if it's not already part of the Property model.
        # For 'rent_price', we need to explicitly select it if we are using DISTINCT.
        select_columns = [Property]
        if sort_by == 'rent_price':
            # Add rent_price to the select list
            select_columns.append(PropertyPricing.rent_price)

        statement = select(*select_columns).join(PropertyLocation).join(PropertyPricing).options(
            selectinload(Property.property_location),
            selectinload(Property.pricing),
            selectinload(Property.features),
            selectinload(Property.property_medias),
            joinedload(Property.property_category)
        )

        if keyword:
            keyword_like = f"%{keyword}%"
            statement = statement.outerjoin(PropertyFeature).outerjoin(Feature)
            statement = statement.where(
                (Property.title.ilike(keyword_like)) |
                (Property.description.ilike(keyword_like)) |
                (Feature.feature_name.ilike(keyword_like))
            )

        if city_id:
            statement = statement.where(PropertyLocation.city_id == city_id)
        if district_id:
            statement = statement.where(
                PropertyLocation.district_id == district_id)
        if commune_id:
            statement = statement.where(
                PropertyLocation.commune_id == commune_id)

        if category_id:
            statement = statement.where(Property.category_id == category_id)

        if sort_by:
            if sort_by not in valid_sort_fields:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid sort_by field. Must be one of {list(valid_sort_fields.keys())}"
                )
            sort_column = valid_sort_fields[sort_by]
            if sort_order == 'desc':
                statement = statement.order_by(sort_column.desc())
            else:
                statement = statement.order_by(sort_column.asc())

        # Get total count
        # For the count query, you might need a separate statement if the main statement
        # has a complex distinct or eager loading that complicates counting.
        # However, for this error, the count query itself isn't the problem.
        # The subquery approach for count is generally robust.
        count_query = select(func.count()).select_from(statement.subquery())
        result = session.exec(count_query).first()
        total_count = result if result is not None else 0

        if total_count == 0:
            return PaginatedPropertyRead(total=0, properties=[])

        statement = statement.offset(offset).limit(limit)
        # Apply distinct *after* ordering if you want the ordering to apply before distincting
        # or, ensure the order by column is in the distinct selection
        properties_raw = session.exec(statement).all()

        # If you added PropertyPricing.rent_price to the select_columns,
        # 'properties_raw' will contain tuples like (Property_object, rent_price).
        # You'll need to adjust how you extract the Property object.
        if sort_by == 'rent_price':
            # Extract the Property object
            properties = [item[0] for item in properties_raw]
        else:
            properties = properties_raw

        property_reads = []
        for p in properties:
            try:
                location = p.property_location
                city = session.exec(select(City).where(
                    City.city_id == location.city_id)).first() if location else None
                district = session.exec(select(District).where(
                    District.district_id == location.district_id)).first() if location else None
                commune = session.exec(select(Commune).where(
                    Commune.commune_id == location.commune_id)).first() if location else None

                location_read = None
                if location:
                    location_read = PropertyLocationRead(
                        location_id=location.location_id,
                        property_id=location.property_id,
                        city_id=location.city_id,
                        district_id=location.district_id,
                        commune_id=location.commune_id,
                        street_number=location.street_number,
                        latitude=location.latitude,
                        longitude=location.longitude,
                        city_name=city.city_name if city else "Unknown",
                        district_name=district.district_name if district else "Unknown",
                        commune_name=commune.commune_name if commune else "Unknown"
                    )

                property_read = PropertyRead(
                    property_id=p.property_id,
                    title=p.title,
                    description=p.description,
                    bedrooms=p.bedrooms,
                    bathrooms=p.bathrooms,
                    land_area=p.land_area,
                    floor_area=p.floor_area,
                    status=p.status,
                    updated_at=p.updated_at,
                    listed_at=p.listed_at,
                    user_id=p.user_id,
                    category_name=p.property_category.category_name if p.property_category else None,
                    rating=p.rating,
                    pricing=PropertyPricingRead.model_validate(
                        p.pricing) if p.pricing else None,
                    location=location_read,
                    media=[PropertyMediaRead.model_validate(
                        m) for m in p.property_medias] if hasattr(p, "property_medias") else [],
                    features=[FeatureRead.model_validate(
                        f) for f in p.features] if hasattr(p, "features") else []
                )
                property_reads.append(property_read)
            except Exception as e:
                # Log the specific error for debugging
                print(f"Error processing property: {e}")
                pass

        return PaginatedPropertyRead(total=total_count, properties=property_reads)
    except SQLAlchemyError as e:
        # Log the SQLAlchemy error for more details
        print(f"SQLAlchemy Error: {e}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        # Log unexpected errors
        print(f"Unexpected Error: {e}")
        raise HTTPException(
            status_code=500, detail="Unexpected error occurred")


def validate_property_ids(property_ids: List[int]) -> None:
    """
    Validates the list of property IDs for comparison.

    Args:
        property_ids (List[int]): List of property IDs.

    Raises:
        HTTPException: If list is empty or exceeds limit.
    """
    if not property_ids:
        raise HTTPException(status_code=400, detail="No property IDs provided")
    if len(property_ids) > 5:
        raise HTTPException(
            status_code=400, detail="Cannot compare more than 5 properties")


def check_properties_in_wishlist(session: Session, property_ids: List[int], user_id: int) -> None:
    """
    Ensures all requested properties are in the user's wishlist.

    Args:
        session (Session): Database session.
        property_ids (List[int]): Property IDs to check.
        user_id (int): Authenticated user ID.

    Raises:
        HTTPException: If any property is not in the wishlist.
    """
    wishlist_check = session.exec(
        select(Property)
        .join(WishList, (WishList.property_id == Property.property_id) & (WishList.user_id == user_id))
        .where(Property.property_id.in_(property_ids))
    ).all()

    if len(wishlist_check) != len(property_ids):
        raise HTTPException(
            status_code=403, detail="Some properties are not in your wishlist")


def fetch_comparison_properties(session: Session, property_ids: List[int]):
    """
    Fetches full property details including pricing, location, and features.
    Media is fetched separately to handle one-to-many relationships effectively.

    Args:
        session (Session): Database session.
        property_ids (List[int]): Property IDs to fetch.

    Returns:
        List[tuple]: Query result tuples of property data (excluding media).

    Raises:
        HTTPException: If no properties are found.
    """
    statement = (
        select(Property, PropertyPricing, PropertyLocation, City, District)
        .join(PropertyPricing, PropertyPricing.property_id == Property.property_id)
        .join(PropertyLocation, PropertyLocation.property_id == Property.property_id)
        .join(City, City.city_id == PropertyLocation.city_id)
        .join(District, District.district_id == PropertyLocation.district_id)
        .options(joinedload(Property.features)) # .joinedload(Feature.properties) is not needed here
        .where(Property.property_id.in_(property_ids))
    )

    properties_data = session.exec(statement).unique().all()

    if not properties_data:
        raise HTTPException(status_code=404, detail="No properties found")

    # Fetch media separately to aggregate all media for each property
    media_statement = (
        select(PropertyMedia)
        .where(PropertyMedia.property_id.in_(property_ids))
        .where(PropertyMedia.media_type == "image")
    )
    media_results = session.exec(media_statement).all()

    # Organize media by property_id
    property_media_map = defaultdict(list)
    for media_item in media_results:
        property_media_map[media_item.property_id].append(media_item.media_url)

    return properties_data, property_media_map


def build_comparison_items(results_tuple) -> List[PropertyComparisonItem]:
    """
    Structures property data into comparison-ready format,
    aggregating all media URLs for each property.

    Args:
        results_tuple (tuple): A tuple containing raw query results for properties
                               and a dictionary mapping property_id to media URLs.

    Returns:
        List[PropertyComparisonItem]: Structured property data.
    """
    properties_data, property_media_map = results_tuple
    comparison_data = []

    for result in properties_data:
        property, pricing, location, city, district = result
        features = [feature.feature_name for feature in property.features]
        media_urls = property_media_map.get(property.property_id, [])

        comparison_data.append(PropertyComparisonItem(
            property_id=property.property_id,
            title=property.title,
            rent_price=pricing.rent_price,
            city_name=city.city_name,
            district_name=district.district_name,
            bedrooms=property.bedrooms,
            bathrooms=property.bathrooms,
            floor_area=property.floor_area,
            features=features,
            media_urls=media_urls,
            status=property.status
        ))
    return comparison_data


def get_properties_for_comparison(session: Session, property_ids: List[int], user_id: int) -> List[PropertyComparisonItem]:
    """
    Retrieves and formats property data for comparison, ensuring they're in the user's wishlist.

    Args:
        session (Session): Database session.
        property_ids (List[int]): Property IDs to compare.
        user_id (int): Authenticated user ID.

    Returns:
        List[PropertyComparisonItem]: Detailed property comparison data.

    Raises:
        HTTPException: On validation failure, missing wishlist entries, or not found.
    """
    validate_property_ids(property_ids)
    check_properties_in_wishlist(session, property_ids, user_id)
    results = fetch_comparison_properties(session, property_ids)
    return build_comparison_items(results)


def get_owner_properties(session: Session, user: User) -> List[PropertyOwnerListing]:
    """
    Fetch all properties owned by the authenticated property owner.

    Args:
        session (Session): Database session.
        user (User): Authenticated user.

    Returns:
        List[dict]: List of property details (property_id, title, type, status, date_listed).

    Raises:
        HTTPException: If user is not a property owner or not approved.
    """
    # Validate user role and approval
    if user.role != UserRole.property_owner:
        raise HTTPException(
            status_code=403, detail="Only property owners can access their listings")
    if not user.is_approved:
        raise HTTPException(
            status_code=403, detail="Account awaiting approval")

    # Fetch properties with category
    statement = (
        select(Property, PropertyCategory)
        .join(PropertyCategory, PropertyCategory.category_id == Property.category_id)
        .where(Property.user_id == user.user_id)
    )

    results = session.exec(statement).all()

    # Structure response
    properties = [
        PropertyOwnerListing(
            property_id=property.property_id,
            title=property.title,
            category=category.category_name,
            status=property.status,
            date_listed=property.listed_at
        )
        for property, category in results
    ]
    return properties


def get_property_stats(
    *,
    session: Session,
    user: User
) -> PropertyStatsResponse:
    """
    Retrieve statistics for properties owned and rented by the authenticated user.

    Args:
        session: SQLModel database session.
        user: Authenticated user.

    Returns:
        PropertyStatsResponse with counts of owned and rented properties.

    Raises:
        HTTPException: If user is not a property owner or not approved.
    """
    if user.role != UserRole.property_owner:
        raise HTTPException(
            status_code=403, detail="Only property owners can access property stats")
    if not user.is_approved:
        raise HTTPException(
            status_code=403, detail="Account awaiting approval")

    try:
        total_owned = session.exec(
            select(func.count()).select_from(Property).where(
                Property.user_id == user.user_id)
        ).first() or 0

        total_rented = session.exec(
            select(func.count()).select_from(Property).where(
                (Property.user_id == user.user_id) & (
                    Property.status == PropertyStatusEnum.rented)
            )
        ).first() or 0

        return PropertyStatsResponse(
            total_owned=total_owned,
            total_rented=total_rented
        )
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_property_stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in get_property_stats: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Unexpected error occurred")


def get_recommended_properties(
    *,
    session: Session,
    property_ids: List[int],
    limit: int,
    status: str = None
) -> List[PropertyRead]:
    """
    Fetch details for recommended properties by IDs.

    Args:
        session: SQLModel database session.
        property_ids: List of property IDs to fetch.
        limit: Maximum number of properties to return.
        status: (Optional) Property status filter (e.g., 'available').

    Returns:
        List of PropertyRead objects, preserving the order of property_ids.

    Raises:
        HTTPException: If the status is invalid.
    """
    try:
        # Validate status if provided
        if status and status not in PropertyStatusEnum.__members__:
            raise HTTPException(
                status_code=400, detail=f"Invalid status: {status}")

        # Build query (ignore status if not provided)
        query = select(Property).where(Property.property_id.in_(property_ids))
        if status:
            query = query.where(Property.status == status)

        # Fetch properties
        properties = session.exec(query).all()

        # Preserve order of property_ids and respect limit
        ordered_properties = []
        seen_ids = set()
        for pid in property_ids:
            if len(ordered_properties) >= limit:
                break
            for prop in properties:
                if prop.property_id == pid and pid not in seen_ids:
                    ordered_properties.append(prop)
                    seen_ids.add(pid)
                    break

        # Convert to PropertyRead (reusing get_property_detail_by_id for consistency)
        result = []
        for prop in ordered_properties:
            try:
                prop_read = get_property_detail_by_id(
                    session=session,
                    property_id=prop.property_id,
                    current_user=None  # Public access, no user needed
                )
                result.append(prop_read)
            except HTTPException as e:
                logger.warning(
                    f"Skipping property {prop.property_id}: {e.detail}")

        logger.debug("Fetched %d recommended properties", len(result))
        return result
    except Exception as e:
        logger.error(f"Error in get_recommended_properties: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Unexpected error occurred")


def get_property_counts(
    *,
    session: Session
) -> PropertyCountResponse:
    """
    Get counts of all properties, grouped by status.

    Args:
        session: SQLModel database session.

    Returns:
        PropertyCountResponse with total, available, and rented counts.

    Raises:
        HTTPException: If a database error occurs.
    """
    try:
        # Query for counts by status
        status_counts = session.exec(
            select(Property.status, func.count(Property.property_id))
            .group_by(Property.status)
        ).all()

        # Initialize response
        counts = {
            "total": 0,
            "available": 0,
            "rented": 0
        }

        # Aggregate counts
        for status, count in status_counts:
            counts["total"] += count
            if status == PropertyStatusEnum.available:
                counts["available"] = count
            elif status == PropertyStatusEnum.rented:
                counts["rented"] = count

        return PropertyCountResponse(**counts)
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_property_counts: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in get_property_counts: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Unexpected error occurred")
