from enum import Enum

class OAuthProvider(str, Enum):
    none = "none"
    google = "google"


class UserRole(str, Enum):
    customer = "customer"
    admin = "admin"
    property_owner = "property_owner"


class PropertyStatusEnum(str, Enum):
    available = "available"
    rented = "rented"


class MediaType(str, Enum):
    image = "image"
    video = "video"


class ViewingRequestStatusEnum(str, Enum):
    pending = "pending"
    accepted = "accepted"
    denied = "denied"

class ReviewStatusEnum(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"