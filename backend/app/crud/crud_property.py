import logging
from sqlmodel import Session, select, func
from app.models.enums import UserRole, PropertyStatusEnum
from app.models.property_schemas import (
    PropertyCreate, PropertyRead, PropertyUpdate,
    PropertyPricingRead, PropertyMediaRead, PropertyLocationRead, FeatureRead,
    PaginatedPropertyRead, PropertyComparisonItem, PropertyOwnerListing, PropertyStatsResponse
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
    if property.status != PropertyStatusEnum.available:
        if not current_user or (property.user_id != current_user.user_id and current_user.role != UserRole.admin):
            raise HTTPException(status_code=403, detail="Not authorized")
        if not current_user.is_active:
            raise HTTPException(status_code=403, detail="Account inactive")

    # Build location response with names using the ids from PropertyLocation
    location = property.property_location
    city = session.exec(select(City).where(City.city_id == location.city_id)).first()
    district = session.exec(select(District).where(District.district_id == location.district_id)).first()
    commune = session.exec(select(Commune).where(Commune.commune_id == location.commune_id)).first()

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
        media=[PropertyMediaRead.model_validate(m) for m in property.property_medias],
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
) -> PaginatedPropertyRead:
    """
    Search and filter properties by keyword, location, and property type with sorting.
    Args:
        session: SQLModel database session.
        keyword: Search term for title, description, or feature name.
        city_id, district_id, commune_id: Filter by location IDs.
        category_id: Filter by property type.
        sort_by: Field to sort by (e.g., rent_price, bedrooms, floor_area, listed_at).
        sort_order: Sort direction (asc or desc).
        offset, limit: Pagination parameters.
    Returns:
        PaginatedPropertyRead with total count and list of PropertyRead objects.
    Raises:
        HTTPException: If a database error occurs or invalid sort parameters are provided.
    """
    try:
        # Define valid sort fields
        valid_sort_fields = {
            'rent_price': PropertyPricing.rent_price,
            'bedrooms': Property.bedrooms,
            'floor_area': Property.floor_area,
            'listed_at': Property.listed_at
        }

        # Build query with eager loading
        statement = select(Property).join(PropertyLocation).join(PropertyPricing).options(
            selectinload(Property.property_location),
            selectinload(Property.pricing),
            selectinload(Property.features),
            selectinload(Property.property_medias)
        )

        # Apply keyword search
        if keyword:
            keyword_like = f"%{keyword}%"
            statement = statement.outerjoin(PropertyFeature).outerjoin(Feature)
            statement = statement.where(
                (Property.title.ilike(keyword_like)) |
                (Property.description.ilike(keyword_like)) |
                (Feature.feature_name.ilike(keyword_like))
            )
            logger.debug(f"Statement after applying keyword: {statement}")

        # Apply location filters
        if city_id:
            statement = statement.where(PropertyLocation.city_id == city_id)
            logger.debug(f"Statement after applying city_id: {statement}")
        if district_id:
            statement = statement.where(PropertyLocation.district_id == district_id)
            logger.debug(f"Statement after applying district_id: {statement}")
        if commune_id:
            statement = statement.where(PropertyLocation.commune_id == commune_id)
            logger.debug(f"Statement after applying commune_id: {statement}")

        # Apply category filter
        if category_id:
            statement = statement.where(Property.category_id == category_id)
            logger.debug(f"Statement after applying category_id: {statement}")

        # Apply sorting
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
            logger.debug(f"Statement after applying sorting: {statement}")

        # Get total count
        count_query = select(func.count()).select_from(statement.subquery())
        result = session.exec(count_query).first()
        total_count = result if result is not None else 0

        if total_count == 0:
            logger.debug("No properties found matching the criteria")
            return PaginatedPropertyRead(total=0, properties=[])

        # Apply pagination
        statement = statement.offset(offset).limit(limit)
        properties = session.exec(statement.distinct()).all()
        logger.debug(f"Fetched {len(properties)} properties")

        # Convert to Pydantic models
        property_reads = [PropertyRead.model_validate(p) for p in properties]
        return PaginatedPropertyRead(total=total_count, properties=property_reads)
    except SQLAlchemyError as e:
        logger.error(f"Database error in search_properties: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in search_properties: {str(e)}")
        raise HTTPException(status_code=500, detail="Unexpected error occurred")


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
        raise HTTPException(status_code=400, detail="Cannot compare more than 5 properties")


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
        raise HTTPException(status_code=403, detail="Some properties are not in your wishlist")


def fetch_comparison_properties(session: Session, property_ids: List[int]):
    """
    Fetches full property details including pricing, location, media, and features.
    
    Args:
        session (Session): Database session.
        property_ids (List[int]): Property IDs to fetch.
    
    Returns:
        List[tuple]: Query result tuples of property data.
    
    Raises:
        HTTPException: If no properties are found.
    """
    statement = (
        select(Property, PropertyPricing, PropertyLocation,
               City, District, PropertyMedia)
        .join(PropertyPricing, PropertyPricing.property_id == Property.property_id)
        .join(PropertyLocation, PropertyLocation.property_id == Property.property_id)
        .join(City, City.city_id == PropertyLocation.city_id)
        .join(District, District.district_id == PropertyLocation.district_id)
        .outerjoin(PropertyMedia, (PropertyMedia.property_id == Property.property_id) & (PropertyMedia.media_type == "image"))
        .options(joinedload(Property.features).joinedload(Feature.properties))
        .where(Property.property_id.in_(property_ids))
    )

    results = session.exec(statement).unique().all()

    if not results:
        raise HTTPException(status_code=404, detail="No properties found")

    return results


def build_comparison_items(results) -> List[PropertyComparisonItem]:
    """
    Structures property data into comparison-ready format.
    
    Args:
        results (List[tuple]): Raw query results.
    
    Returns:
        List[PropertyComparisonItem]: Structured property data.
    """
    comparison_data = []
    for result in results:
        property, pricing, location, city, district, media = result[:6]
        features = [feature.feature_name for feature in property.features]
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
            media_url=media.media_url if media else None,
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
            select(func.count()).select_from(Property).where(Property.user_id == user.user_id)
        ).first() or 0

        total_rented = session.exec(
            select(func.count()).select_from(Property).where(
                (Property.user_id == user.user_id) & (Property.status == PropertyStatusEnum.rented)
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
        raise HTTPException(status_code=500, detail="Unexpected error occurred")