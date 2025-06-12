from pydantic import BaseModel

class AdminDashboardStats(BaseModel):
    totalUsers: int
    totalProperties: int
    totalPropertyOwners: int
    
    class Config:
        from_attributes = True 