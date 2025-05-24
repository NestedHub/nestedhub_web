// This file contains mock data for properties and helper functions to access it

export interface PropertyImage {
  id: string
  url: string
  isPrimary?: boolean
}

export interface PropertyAmenity {
  id: string
  name: string
  icon?: string
}

export interface PropertyOwner {
  id: string
  name: string
  phone: string
  email?: string
  avatar?: string
}

export interface Property {
  id: string
  title: string
  type: string
  price: string
  location: string
  bedrooms: number
  bathrooms: number
  description?: string
  amenities?: PropertyAmenity[]
  images?: PropertyImage[]
  owner?: PropertyOwner
  rating?: number
  reviews?: number
  createdAt?: string
  updatedAt?: string
  size?: number
  nearbyPlaces?: string[]
  forRent?: {
    id: string
    name: string
    available: boolean
  }[]
}

// Mock data for properties
const mockProperties: Property[] = [
  // Apartments
  {
    id: "1",
    title: "Luxury Apartment in Downtown",
    type: "Apartment",
    price: "$2,000,000",
    location: "Boul Kerk, Phnom Penh",
    bedrooms: 4,
    bathrooms: 3,
    description:
      "A beautiful luxury apartment in the heart of downtown with stunning city views. Features high-end finishes, a gourmet kitchen, and a spacious balcony.",
    amenities: [
      { id: "a1", name: "Air Conditioning" },
      { id: "a2", name: "Parking" },
      { id: "a3", name: "Swimming Pool" },
      { id: "a4", name: "Gym" },
      { id: "a5", name: "Security" },
    ],
    images: [
      { id: "img1", url: "/property-image.jpg", isPrimary: true },
      { id: "img2", url: "/property.png" },
    ],
    owner: {
      id: "o1",
      name: "John Doe",
      phone: "0987654321",
      email: "john@example.com",
    },
    rating: 4.8,
    reviews: 24,
    createdAt: "2023-01-15",
    updatedAt: "2023-04-20",
    size: 180,
    nearbyPlaces: ["Shopping Mall", "Restaurant", "Park", "School"],
    forRent: [],
  },
  {
    id: "2",
    title: "Modern Apartment with River View",
    type: "Apartment",
    price: "$1,800,000",
    location: "Riverside, Phnom Penh",
    bedrooms: 3,
    bathrooms: 2,
    description:
      "Enjoy stunning river views from this modern apartment. Features open floor plan, floor-to-ceiling windows, and premium appliances.",
    amenities: [
      { id: "a1", name: "Air Conditioning" },
      { id: "a2", name: "Parking" },
      { id: "a3", name: "Swimming Pool" },
      { id: "a6", name: "Balcony" },
    ],
    images: [{ id: "img1", url: "/property.png", isPrimary: true }],
    owner: {
      id: "o2",
      name: "Jane Smith",
      phone: "0987654322",
      email: "jane@example.com",
    },
    rating: 4.6,
    reviews: 18,
    createdAt: "2023-02-10",
    updatedAt: "2023-05-15",
    size: 150,
    nearbyPlaces: ["River", "Restaurant", "Cafe", "Market"],
    forRent: [],
  },
  {
    id: "3",
    title: "Cozy Apartment Near University",
    type: "Apartment",
    price: "$800,000",
    location: "Toul Kork, Phnom Penh",
    bedrooms: 2,
    bathrooms: 1,
    description:
      "Perfect for students or young professionals. Located near major universities with easy access to public transportation.",
    amenities: [
      { id: "a1", name: "Air Conditioning" },
      { id: "a7", name: "Internet" },
      { id: "a8", name: "Laundry" },
    ],
    images: [{ id: "img1", url: "/property-image.jpg", isPrimary: true }],
    owner: {
      id: "o3",
      name: "Sam Wilson",
      phone: "0987654323",
      email: "sam@example.com",
    },
    rating: 4.2,
    reviews: 12,
    createdAt: "2023-03-05",
    updatedAt: "2023-06-10",
    size: 85,
    nearbyPlaces: ["University", "Cafe", "Library", "Convenience Store"],
    forRent: [],
  },
  {
    id: "4",
    title: "Family Apartment with Garden",
    type: "Apartment",
    price: "$1,500,000",
    location: "BKK1, Phnom Penh",
    bedrooms: 3,
    bathrooms: 2,
    description:
      "Spacious family apartment with a private garden. Perfect for families with children. Close to international schools.",
    amenities: [
      { id: "a1", name: "Air Conditioning" },
      { id: "a2", name: "Parking" },
      { id: "a9", name: "Garden" },
      { id: "a10", name: "Playground" },
    ],
    images: [{ id: "img1", url: "/property.png", isPrimary: true }],
    owner: {
      id: "o4",
      name: "Emily Johnson",
      phone: "0987654324",
      email: "emily@example.com",
    },
    rating: 4.7,
    reviews: 20,
    createdAt: "2023-04-20",
    updatedAt: "2023-07-15",
    size: 160,
    nearbyPlaces: ["International School", "Park", "Supermarket", "Hospital"],
    forRent: [],
  },
  {
    id: "5",
    title: "Penthouse Apartment with Rooftop",
    type: "Apartment",
    price: "$3,000,000",
    location: "Diamond Island, Phnom Penh",
    bedrooms: 5,
    bathrooms: 4,
    description:
      "Luxurious penthouse with private rooftop terrace offering panoramic city views. Features high-end finishes and smart home technology.",
    amenities: [
      { id: "a1", name: "Air Conditioning" },
      { id: "a2", name: "Parking" },
      { id: "a3", name: "Swimming Pool" },
      { id: "a4", name: "Gym" },
      { id: "a11", name: "Rooftop Terrace" },
      { id: "a12", name: "Smart Home" },
    ],
    images: [{ id: "img1", url: "/property-image.jpg", isPrimary: true }],
    owner: {
      id: "o5",
      name: "Michael Brown",
      phone: "0987654325",
      email: "michael@example.com",
    },
    rating: 4.9,
    reviews: 30,
    createdAt: "2023-05-10",
    updatedAt: "2023-08-05",
    size: 250,
    nearbyPlaces: ["Shopping Mall", "Fine Dining", "Park", "Spa"],
    forRent: [],
  },
]

// Helper functions

// Get all properties with optional filtering and sorting
export async function getAllProperties(options?: {
  limit?: number
  sortBy?: "price" | "date" | "rating"
  order?: "asc" | "desc"
}): Promise<Property[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  let result = [...mockProperties]

  // Apply sorting
  if (options?.sortBy) {
    result.sort((a, b) => {
      if (options.sortBy === "price") {
        const priceA = Number.parseFloat(a.price.replace(/[^0-9.]/g, ""))
        const priceB = Number.parseFloat(b.price.replace(/[^0-9.]/g, ""))
        return options.order === "asc" ? priceA - priceB : priceB - priceA
      } else if (options.sortBy === "date") {
        const dateA = new Date(a.createdAt || "").getTime()
        const dateB = new Date(b.createdAt || "").getTime()
        return options.order === "asc" ? dateA - dateB : dateB - dateA
      } else if (options.sortBy === "rating") {
        const ratingA = a.rating || 0
        const ratingB = b.rating || 0
        return options.order === "asc" ? ratingA - ratingB : ratingB - ratingA
      }
      return 0
    })
  }

  // Apply limit
  if (options?.limit) {
    result = result.slice(0, options.limit)
  }

  return result
}

// Get properties by type with optional limit
export async function getPropertiesByType(type: string, limit?: number): Promise<Property[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  let result = mockProperties.filter((p) => p.type.toLowerCase() === type.toLowerCase())

  if (limit) {
    result = result.slice(0, limit)
  }

  return result
}

// Get new listings (most recently added)
export async function getNewListings(limit = 5): Promise<Property[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Sort by createdAt date and take the most recent ones
  return [...mockProperties]
    .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
    .slice(0, limit)
}

// Get a single property by ID
export async function getPropertyById(id: string): Promise<Property | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const property = mockProperties.find((p) => p.id === id)
  return property || null
}

// Helper functions for specific property types
export async function getDormProperties(limit?: number): Promise<Property[]> {
  return getPropertiesByType("Dorm", limit)
}

export async function getCondoProperties(limit?: number): Promise<Property[]> {
  return getPropertiesByType("Condo", limit)
}

export async function getApartmentProperties(limit?: number): Promise<Property[]> {
  return getPropertiesByType("Apartment", limit)
}

// Get related properties
export async function getRelatedProperties(propertyId: string, limit: number): Promise<Property[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // In a real application, you would fetch related properties based on some criteria
  // For this mock data, we'll just return a few different properties
  return mockProperties.filter((property) => property.id !== propertyId).slice(0, limit)
}

// Export the mock data for direct access if needed
export const mockPropertyData = mockProperties
