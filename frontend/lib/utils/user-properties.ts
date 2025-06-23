// api/properties.ts
import { fetchUnauthenticated } from "./user-api";

// Assuming this type definition is available from your API schema or generated types
export type PropertyRead = {
  property_id: number;
  title: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  land_area: string;
  floor_area: string;
  status: 'available' | 'rented' | 'sold'; // Example statuses, adjust as per your API
  updated_at: string;
  listed_at: string;
  user_id: number;
  category_name: string;
  rating: string;
  pricing: {
    rent_price: string;
    electricity_price: string;
    water_price: string;
    other_price: string;
    available_from: string;
  };
  location: {
    location_id: number;
    property_id: number;
    city_id: number;
    district_id: number;
    commune_id: number;
    street_number: string;
    latitude: string;
    longitude: string;
    city_name: string;
    district_name: string;
    commune_name: string;
  };
  media: any[]; // You might want to define a more specific type for media
  features: any[]; // You might want to define a more specific type for features
};

/**
 * @function getUserProperties
 * @description API call to get a list of properties owned by a specific user.
 * @param {number} userId - The ID of the user whose properties are to be fetched.
 * @returns {Promise<PropertyRead[]>} A promise that resolves with an array of PropertyRead objects.
 * @throws {Error} Throws an error if the network response is not OK.
 */
export async function getUserProperties(userId: number): Promise<PropertyRead[]> {
  console.log(`API Fetcher: Attempting to fetch properties for user ID: ${userId}`);
  // Replace `fetchAuthenticated` with your actual authenticated fetch utility or standard fetch.
  // Assuming fetchAuthenticated handles errors by throwing them.
  const response = await fetchUnauthenticated<PropertyRead[]>(`/properties/user/${userId}`, 'GET');
  return response;
}