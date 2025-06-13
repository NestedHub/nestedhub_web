// lib/mockData/mockPropertiesApi.ts

export interface ApiProperty {
  property_id: string
  title: string
  description: string
  bedrooms: number
  bathrooms: number
  land_area: number
  floor_area: number
  status: string
  updated_at: string
  listed_at: string
  user_id: number
  category_name: string
  rating: number
  pricing: {
    rent_price: number
    electricity_price: number
    water_price: number
    available_from: string
  }
  location: {
    location_id: number
    property_id: number
    city_id: number
    district_id: number
    commune_id: number
    street_number: string
    latitude: number
    longitude: number
    city_name: string
    district_name: string
    commune_name: string
  }
  media: { media_url: string; media_type: string }[]
  features: { feature_id: number; feature_name: string }[]
}

const mockApiProperties: ApiProperty[] = [
  {
    property_id: "1",
    title: "Luxury Apartment in Downtown",
    description: "A beautiful luxury apartment in the heart of downtown with stunning city views.",
    bedrooms: 4,
    bathrooms: 3,
    land_area: 200,
    floor_area: 180,
    status: "available",
    updated_at: "2025-04-20T10:00:00Z",
    listed_at: "2025-01-15T10:00:00Z",
    user_id: 1,
    category_name: "Apartment",
    rating: 4.8,
    pricing: {
      rent_price: 2000,
      electricity_price: 0.15,
      water_price: 0.10,
      available_from: "2025-02-01",
    },
    location: {
      location_id: 1,
      property_id: 1,
      city_id: 1,
      district_id: 1,
      commune_id: 1,
      street_number: "123 Main St",
      latitude: 11.5621,
      longitude: 104.9160,
      city_name: "Phnom Penh",
      district_name: "Daun Penh",
      commune_name: "Boul Kerk",
    },
    media: [
      { media_url: "/property-image.jpg", media_type: "image" },
      { media_url: "/property.png", media_type: "image" },
    ],
    features: [
      { feature_id: 1, feature_name: "Air Conditioning" },
      { feature_id: 2, feature_name: "Parking" },
      { feature_id: 3, feature_name: "Swimming Pool" },
    ],
  },
  {
    property_id: "2",
    title: "Modern Apartment with River View",
    description: "Enjoy stunning river views from this modern apartment.",
    bedrooms: 3,
    bathrooms: 2,
    land_area: 160,
    floor_area: 150,
    status: "available",
    updated_at: "2025-05-15T10:00:00Z",
    listed_at: "2025-02-10T10:00:00Z",
    user_id: 2,
    category_name: "Apartment",
    rating: 4.6,
    pricing: {
      rent_price: 1800,
      electricity_price: 0.15,
      water_price: 0.10,
      available_from: "2025-03-01",
    },
    location: {
      location_id: 2,
      property_id: 2,
      city_id: 1,
      district_id: 2,
      commune_id: 2,
      street_number: "456 Riverside Rd",
      latitude: 11.5630,
      longitude: 104.9200,
      city_name: "Phnom Penh",
      district_name: "Chamkar Mon",
      commune_name: "Riverside",
    },
    media: [{ media_url: "/property.png", media_type: "image" }],
    features: [
      { feature_id: 1, feature_name: "Air Conditioning" },
      { feature_id: 2, feature_name: "Parking" },
      { feature_id: 4, feature_name: "Balcony" },
    ],
  },
  {
    property_id: "3",
    title: "Cozy House Near University",
    description: "Perfect for families or students, close to major universities.",
    bedrooms: 3,
    bathrooms: 2,
    land_area: 250,
    floor_area: 200,
    status: "available",
    updated_at: "2025-06-10T10:00:00Z",
    listed_at: "2025-03-05T10:00:00Z",
    user_id: 3,
    category_name: "House",
    rating: 4.2,
    pricing: {
      rent_price: 1200,
      electricity_price: 0.15,
      water_price: 0.10,
      available_from: "2025-04-01",
    },
    location: {
      location_id: 3,
      property_id: 3,
      city_id: 1,
      district_id: 3,
      commune_id: 3,
      street_number: "789 University Ave",
      latitude: 11.5700,
      longitude: 104.9100,
      city_name: "Phnom Penh",
      district_name: "Toul Kork",
      commune_name: "Toul Kork",
    },
    media: [{ media_url: "/property-image.jpg", media_type: "image" }],
    features: [
      { feature_id: 1, feature_name: "Air Conditioning" },
      { feature_id: 5, feature_name: "Internet" },
    ],
  },
  {
    property_id: "4",
    title: "Spacious Room for Rent",
    description: "Affordable room in a shared house, ideal for students.",
    bedrooms: 1,
    bathrooms: 1,
    land_area: 50,
    floor_area: 40,
    status: "available",
    updated_at: "2025-07-15T10:00:00Z",
    listed_at: "2025-04-20T10:00:00Z",
    user_id: 4,
    category_name: "Room",
    rating: 4.0,
    pricing: {
      rent_price: 300,
      electricity_price: 0.15,
      water_price: 0.10,
      available_from: "2025-05-01",
    },
    location: {
      location_id: 4,
      property_id: 4,
      city_id: 1,
      district_id: 4,
      commune_id: 4,
      street_number: "101 Student Lane",
      latitude: 11.5600,
      longitude: 104.9150,
      city_name: "Phnom Penh",
      district_name: "BKK1",
      commune_name: "BKK1",
    },
    media: [{ media_url: "/property.png", media_type: "image" }],
    features: [
      { feature_id: 5, feature_name: "Internet" },
      { feature_id: 6, feature_name: "Shared Kitchen" },
    ],
  },
  {
    property_id: "5",
    title: "Penthouse Apartment with Rooftop",
    description: "Luxurious penthouse with private rooftop terrace.",
    bedrooms: 5,
    bathrooms: 4,
    land_area: 300,
    floor_area: 250,
    status: "available",
    updated_at: "2025-08-05T10:00:00Z",
    listed_at: "2025-05-10T10:00:00Z",
    user_id: 5,
    category_name: "Apartment",
    rating: 4.9,
    pricing: {
      rent_price: 3000,
      electricity_price: 0.15,
      water_price: 0.10,
      available_from: "2025-06-01",
    },
    location: {
      location_id: 5,
      property_id: 5,
      city_id: 1,
      district_id: 5,
      commune_id: 5,
      street_number: "200 Diamond St",
      latitude: 11.5500,
      longitude: 104.9250,
      city_name: "Phnom Penh",
      district_name: "Koh Pich",
      commune_name: "Diamond Island",
    },
    media: [{ media_url: "/property-image.jpg", media_type: "image" }],
    features: [
      { feature_id: 1, feature_name: "Air Conditioning" },
      { feature_id: 3, feature_name: "Swimming Pool" },
      { feature_id: 7, feature_name: "Rooftop Terrace" },
    ],
  },
];

// Simulate API response structure
interface PaginatedPropertyRead {
  total: number
  properties: ApiProperty[]
}

// Helper functions mimicking API behavior
export async function getNewListings(limit = 5): Promise<ApiProperty[]> {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay
  return [...mockApiProperties]
    .sort((a, b) => new Date(b.listed_at).getTime() - new Date(a.listed_at).getTime())
    .slice(0, limit);
}

export async function getPropertiesByType(categoryName: string, limit?: number): Promise<ApiProperty[]> {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay
  let result = mockApiProperties.filter((p) => p.category_name.toLowerCase() === categoryName.toLowerCase());
  if (limit) {
    result = result.slice(0, limit);
  }
  return result;
}

export const mockApiPropertyData = mockApiProperties;