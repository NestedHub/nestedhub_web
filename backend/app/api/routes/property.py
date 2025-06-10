from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Optional, List
from fastapi import Query
import logging
from app.api.deps import get_db_session, get_current_user, require_owner_or_admin, require_admin
from app.crud.crud_property import (
    create_property,
    get_property_detail_by_id,
    update_property,
    delete_property,
    search_properties,
    get_properties_for_comparison,
    get_owner_properties,
    get_property_stats,
    get_recommended_properties,
    get_property_counts
)
from app.models.models import User, PropertyCategory, City, District, Commune, Feature
from app.models.property_schemas import (
    PropertyRead,
    PropertyCreate,
    PropertyUpdate,
    PaginatedPropertyRead,
    PropertyComparisonResponse,
    PropertyOwnerListingsResponse,
    CityResponse,
    DistrictResponse,
    CommuneResponse,
    CategoryResponse,
    PropertyComparisonRequest,
    FeatureResponse,
    PropertyStatsResponse,
    PropertyCountResponse
)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/properties")

@router.get("/count", response_model=PropertyCountResponse)
def get_property_counts_handler(
    session: Session = Depends(get_db_session),
    current_user: User = Depends(require_admin)
):
    """
    Get counts of all properties, grouped by status (total, available, rented).
    Restricted to admins.
    """
    logger.debug("Fetching property counts for admin")
    return get_property_counts(session=session)

@router.get("/recommended", response_model=List[PropertyRead])
def get_recommended_properties_handler(
    property_ids: Optional[str] = Query(None, description="Comma-separated list of property IDs"),
    limit: int = Query(6, ge=1, le=10, description="Maximum number of properties to return"),
    # status: Optional[str] = Query("available", description="Property status filter"),
    session: Session = Depends(get_db_session)
):
    """
    Get recommended properties by IDs for the 'For You' section.
    Returns full property details, filtered by status (default: available).
    """
    logger.debug("Fetching recommended properties for IDs: %s, limit: %d, status: %s", property_ids, limit)
    if not property_ids:
        return []
    
    try:
        id_list = [int(pid) for pid in property_ids.split(",") if pid.strip()]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid property_ids format; use comma-separated integers")
    
    return get_recommended_properties(
        session=session,
        property_ids=id_list,
        limit=limit,
        # status=status
    )

@router.post("/", response_model=PropertyRead, status_code=201)
def create_new_property(
    property_data: PropertyCreate,
    current_user: User = Depends(require_owner_or_admin),
    session: Session = Depends(get_db_session)
):
    logger.debug("Creating property with session: %s", session)
    return create_property(
        session=session,
        property_data=property_data,
        current_user=current_user
    )


@router.get("/stats", response_model=PropertyStatsResponse)
def get_property_owner_stats(
    user: User = Depends(require_owner_or_admin),
    session: Session = Depends(get_db_session)
):
    logger.debug("Fetching property stats for user %s with session: %s",
                 user.user_id, session)
    try:
        stats = get_property_stats(session=session, user=user)
        return stats
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching property stats: {str(e)}")

@router.get("/my-listings", response_model=PropertyOwnerListingsResponse)
def get_my_property_listings(
    user: User = Depends(require_owner_or_admin),
    session: Session = Depends(get_db_session)
):
    logger.debug("Fetching listings for user %s with session: %s",
                 user.user_id, session)
    try:
        properties = get_owner_properties(session=session, user=user)
        return PropertyOwnerListingsResponse(properties=properties)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching listings: {str(e)}")


@router.get("/{property_id}", response_model=PropertyRead)
def get_property(
    property_id: int,
    session: Session = Depends(get_db_session)
):
    logger.debug("Fetching property %s with session: %s", property_id, session)
    return get_property_detail_by_id(
        session=session,
        property_id=property_id,
        current_user=None
    )


@router.patch("/{property_id}", response_model=PropertyRead)
def update_existing_property(
    property_id: int,
    property_data: PropertyUpdate,
    current_user: User = Depends(require_owner_or_admin),
    session: Session = Depends(get_db_session)
):
    logger.debug("Updating property %s with session: %s", property_id, session)
    return update_property(
        session=session,
        property_id=property_id,
        property_data=property_data,
        current_user=current_user
    )


@router.delete("/{property_id}", status_code=204)
def delete_existing_property(
    property_id: int,
    current_user: User = Depends(require_owner_or_admin),
    session: Session = Depends(get_db_session)
):
    logger.debug("Deleting property %s with session: %s", property_id, session)
    delete_property(
        session=session,
        property_id=property_id,
        current_user=current_user
    )
    return None


@router.get("/", response_model=PaginatedPropertyRead)
def search_properties_handler(
    keyword: Optional[str] = Query(
        None, description="Search title, description, or features"),
    city_id: Optional[int] = Query(None, description="Filter by city ID"),
    district_id: Optional[int] = Query(
        None, description="Filter by district ID"),
    commune_id: Optional[int] = Query(
        None, description="Filter by commune ID"),
    category_id: Optional[int] = Query(
        None, description="Filter by category ID"),
    sort_by: Optional[str] = Query(
        None, description="Field to sort by (e.g., rent_price, bedrooms, floor_area, listed_at)"),
    sort_order: Optional[str] = Query(
        None, description="Sort order (asc or desc)", regex="^(asc|desc)$"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(10, ge=1, le=50, description="Pagination limit"),
    session: Session = Depends(get_db_session)
):
    logger.debug(
        "Searching properties with keyword=%s, sort_by=%s, sort_order=%s, session=%s",
        keyword, sort_by, sort_order, session)
    return search_properties(
        session=session,
        keyword=keyword,
        city_id=city_id,
        district_id=district_id,
        commune_id=commune_id,
        category_id=category_id,
        sort_by=sort_by,
        sort_order=sort_order,
        offset=offset,
        limit=limit
    )


@router.post("/compare", response_model=PropertyComparisonResponse)
def compare_properties(
    request: PropertyComparisonRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_db_session)
):
    logger.debug("Comparing properties with session: %s", session)
    try:
        comparison_data = get_properties_for_comparison(
            session=session,
            property_ids=request.property_ids,
            user_id=user.user_id
        )
        return PropertyComparisonResponse(properties=comparison_data)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error comparing properties: {str(e)}")


@router.get("/filters/cities", response_model=List[CityResponse])
def get_cities(
    query: Optional[str] = Query(
        None, description="Filter cities by name (partial match)"),
    session: Session = Depends(get_db_session)
):
    logger.debug("Fetching cities with query=%s, session=%s", query, session)
    try:
        statement = select(City)
        if query:
            statement = statement.where(City.city_name.ilike(f"%{query}%"))
        statement = statement.order_by(City.city_name)
        cities = session.exec(statement).all()
        return [CityResponse(city_id=c.city_id, city_name=c.city_name) for c in cities]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch cities: {str(e)}")


@router.get("/filters/districts", response_model=List[DistrictResponse])
def get_districts(
    city_id: int = Query(..., description="City ID to filter districts"),
    query: Optional[str] = Query(
        None, description="Filter districts by name (partial match)"),
    session: Session = Depends(get_db_session)
):
    logger.debug("Fetching districts for city_id=%s, session=%s",
                 city_id, session)
    try:
        if not session.exec(select(City).where(City.city_id == city_id)).first():
            raise HTTPException(status_code=400, detail="Invalid city_id")
        statement = select(District).where(District.city_id == city_id)
        if query:
            statement = statement.where(
                District.district_name.ilike(f"%{query}%"))
        statement = statement.order_by(District.district_name)
        districts = session.exec(statement).all()
        return [DistrictResponse(district_id=d.district_id, district_name=d.district_name) for d in districts]
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch districts: {str(e)}")


@router.get("/filters/communes", response_model=List[CommuneResponse])
def get_communes(
    district_id: int = Query(...,
                             description="District ID to filter communes"),
    query: Optional[str] = Query(
        None, description="Filter communes by name (partial match)"),
    session: Session = Depends(get_db_session)
):
    logger.debug("Fetching communes for district_id=%s, session=%s",
                 district_id, session)
    try:
        if not session.exec(select(District).where(District.district_id == district_id)).first():
            raise HTTPException(status_code=400, detail="Invalid district_id")
        statement = select(Commune).where(Commune.district_id == district_id)
        if query:
            statement = statement.where(
                Commune.commune_name.ilike(f"%{query}%"))
        statement = statement.order_by(Commune.commune_name)
        communes = session.exec(statement).all()
        return [CommuneResponse(commune_id=c.commune_id, commune_name=c.commune_name) for c in communes]
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch communes: {str(e)}")


@router.get("/filters/categories", response_model=List[CategoryResponse])
def get_categories(
    query: Optional[str] = Query(
        None, description="Filter categories by name (partial match)"),
    session: Session = Depends(get_db_session)
):
    logger.debug("Fetching categories with query=%s, session=%s",
                 query, session)
    try:
        statement = select(PropertyCategory)
        if query:
            statement = statement.where(
                PropertyCategory.category_name.ilike(f"%{query}%"))
        statement = statement.order_by(PropertyCategory.category_name)
        categories = session.exec(statement).all()
        return [CategoryResponse(category_id=c.category_id, category_name=c.category_name) for c in categories]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch categories: {str(e)}")
    
@router.get("/filters/features", response_model=List[FeatureResponse])
def get_features(
    query: Optional[str] = Query(
        None, description="Filter features by name (partial match)"),
    session: Session = Depends(get_db_session)
):
    logger.debug("Fetching features with query=%s, session=%s", query, session)
    try:
        statement = select(Feature)
        if query:
            statement = statement.where(
                Feature.feature_name.ilike(f"%{query}%"))
        statement = statement.order_by(Feature.feature_name)
        features = session.exec(statement).all()
        return [FeatureResponse(feature_id=f.feature_id, feature_name=f.feature_name) for f in features]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch features: {str(e)}")

