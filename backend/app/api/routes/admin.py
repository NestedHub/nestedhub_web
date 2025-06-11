from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from app.api.deps import get_db_session, require_admin
from app.models.models import User, Property
from app.models.enums import UserRole
from app.models.admin_schemas import AdminDashboardStats

router = APIRouter(prefix="/admin")

@router.get("/dashboard/stats", response_model=AdminDashboardStats)
async def get_dashboard_stats(
    session: Session = Depends(get_db_session),
    current_user: User = Depends(require_admin)
):
    """
    Get dashboard statistics for admin.
    Returns total users, total properties, and total property owners.
    """
    try:
        # Get total users (excluding admins)
        total_users = session.exec(
            select(func.count())
            .select_from(User)
            .where(User.role == UserRole.customer)
        ).first() or 0

        # Get total property owners
        total_property_owners = session.exec(
            select(func.count())
            .select_from(User)
            .where(User.role == UserRole.property_owner)
        ).first() or 0

        # Get total properties
        total_properties = session.exec(
            select(func.count())
            .select_from(Property)
        ).first() or 0

        return AdminDashboardStats(
            totalUsers=total_users,
            totalProperties=total_properties,
            totalPropertyOwners=total_property_owners
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching dashboard stats: {str(e)}"
        ) 