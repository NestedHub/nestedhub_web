// lib/types.ts

// --- API Response Specific Types ---
// These interfaces reflect the EXACT shape of data received directly from your backend API endpoints.

export interface WishListCreate {
  property_id: number;
}

export interface WishListResponse {
  user_id: number;
  property_id: number;
  added_at: string; // datetime string, e.g., "2025-06-10T21:46:00Z"
}

export interface ApiPropertyMedia {
  media_url: string;
  media_type: string; // e.g., "image", "video"
}

export interface ApiPropertyFeature {
  feature_id: number;
  feature_name: string;
}

// This interface reflects the EXACT shape of the API response for a single property
export interface ApiProperty { // Renamed from ApiResponseProperty for brevity, if you prefer
  property_id: number;
  title: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  land_area: number;
  floor_area: number;
  status: string;
  updated_at: string;
  listed_at: string;
  user_id: number; // ID of the property owner
  category_name: string;
  pricing: {
    rent_price: number;
    deposit?: number;
    electricity_price?: number;
    water_price?: number;
    available_from: string;
  };
  location: {
    location_id: number;
    property_id: number;
    city_id: number;
    district_id: number;
    commune_id: number;
    street_number: string;
    latitude: number;
    longitude: number;
    city_name: string;
    district_name: string;
    commune_name: string;
  };
  media: ApiPropertyMedia[];
  features: ApiPropertyFeature[];
}

// Review Type (This is what your review API endpoint returns - crucial: includes `status`)
export interface Review { // Renamed from Review to ApiReview for clarity in this context
  review_id: number;
  property_id: number;
  user_id: number; // Crucial for fetching the reviewer's public profile
  rating: number;
  comment: string;
  created_at: string;
  status: string; // <--- ADD THIS FIELD: "approved", "pending", "rejected"
}

// Public User Profile (This is what /api/users/public/{user_id} returns)
export interface ApiPublicUser { // Renamed from PublicUser to ApiPublicUser for clarity
  user_id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  profile_picture_url: string | null;
}


// --- Application's Internal Data Types ---
// These are the types your React components and hooks will generally work with after transformation or combination.

export interface PropertyMedia {
  media_url: string;
  media_type: string;
}

export interface PropertyFeature {
  feature_id: number;
  feature_name: string;
}

export interface PropertyCategory {
  category_id: number;
  category_name: string;
}

export interface Property {
  property_id: number;
  title: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  land_area: number;
  floor_area: number;
  status: string;
  updated_at: string;
  listed_at: string;
  owner_id: number;
  category: PropertyCategory;
  pricing: {
    rent_price: number;
    available_from: string;
  };
  location: {
    location_id: number;
    street_number: string;
    latitude: number;
    longitude: number;
    city: { city_id: number; city_name: string };
    district: { district_id: number; district_name: string };
    commune: { commune_id: number; commune_name: string };
  };
  media: PropertyMedia[];
  features: PropertyFeature[];
}

// Public User object consumed by components
export interface PublicUser { // This is the version components will use
  user_id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  profile_picture_url: string | null;
}

// If you want a type that represents a review *with* reviewer details already attached (optional for this setup)
export interface ReviewForDisplay extends Review {
  reviewer_name?: string;
  reviewer_profile_picture_url?: string;
}

// Full User Profile (for authenticated user context, if applicable)
export interface User {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  id_card_url: string | null;
  profile_picture_url: string | null;
  is_email_verified: boolean;
  is_approved: boolean;
  is_active: boolean;
}