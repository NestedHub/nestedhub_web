// lib/types.ts

// Represents a single media item in the API response for a property
export interface ApiPropertyMedia {
  media_id: number;
  property_id: number;
  media_url: string; // This is the URL of the media file
  media_type: string; // e.g., "image", "video"
}

// Represents a single feature associated with a property in the API response
export interface ApiPropertyFeature {
  feature_id: number;
  feature_name: string; // The name of the feature, e.g., "Swimming Pool", "Balcony"
}

// This is the main interface for a Property, directly mirroring the API's successful response.
// Use this as the 'Property' type throughout your application when dealing with property data.
export interface Property {
  property_id: number;
  title: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  land_area: string; // As per API response, it's a string
  floor_area: string; // As per API response, it's a string
  status: string; // e.g., "available", "rented", "unavailable"
  updated_at: string; // ISO 8601 date-time string
  listed_at: string; // ISO 8601 date-time string
  user_id: number; // This is the ID of the property's owner as returned by the API
  category_name: string;
  rating: string; // As per API response, it's a string (e.g., "4.5", "5.0")
  pricing: {
    rent_price: string; // As per API response, prices are strings
    electricity_price: string; // As per API response, prices are strings
    water_price: string; // As per API response, prices are strings
    other_price: string; // As per API response, prices are strings
    available_from: string; // YYYY-MM-DD date string
  };
  location: {
    location_id: number;
    property_id: number;
    city_id: number;
    district_id: number;
    commune_id: number;
    street_number: string;
    latitude: string; // As per API response, latitude is a string
    longitude: string; // As per API response, longitude is a string
    city_name: string;
    district_name: string;
    commune_name: string;
  };
  media: ApiPropertyMedia[]; // An array of media objects
  features: ApiPropertyFeature[]; // An array of feature objects
}

// Also, if you have a separate WishListResponse, ensure it's correct.
// For example:
export interface WishListResponse {
  wishlist_id: number;
  user_id: number;
  property_id: number;
  added_at: string;
  // If the API returns more details about the property within the wishlist, add them here
  // For example: property_title?: string;
}