from enum import Enum


class PropertyStatusEnum(str, Enum):
    available = "available"
    rented = "rented"


class ViewingRequestStatusEnum(str, Enum):
    pending = "pending"
    accepted = "accepted"
    denied = "denied"

class ReviewStatusEnum(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"