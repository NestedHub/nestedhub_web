// This is a mock API service for properties
// In a real application, this would fetch data from your backend API
import type { Property as NewProperty } from "../mockData/properties"

export interface Property {
  id: string
  title: string
  type: string
  price: string
  location: string
  bedrooms: number
  bathrooms: number
  image: string
  description?: string
  features?: string[]
  owner?: {
    name: string
    contact: string
    email?: string
  }
  createdAt?: string
  updatedAt?: string
}

// Convert new property format to old format for backward compatibility
export function convertToOldPropertyFormat(newProperty: NewProperty): Property {
  // Get the primary image or first image or default
  let imageUrl = "/property.png"
  if (newProperty.images && newProperty.images.length > 0) {
    const primaryImage = newProperty.images.find((img) => img.isPrimary)
    if (primaryImage && primaryImage.url) {
      imageUrl = primaryImage.url
    } else if (newProperty.images[0].url) {
      imageUrl = newProperty.images[0].url
    }
  }

  return {
    id: newProperty.id,
    title: newProperty.title,
    type: newProperty.type,
    price: newProperty.price,
    location: newProperty.location,
    bedrooms: newProperty.bedrooms,
    bathrooms: newProperty.bathrooms,
    image: imageUrl,
    description: newProperty.description,
    features: newProperty.amenities?.map((a) => a.name) || [],
    owner: {
      name: newProperty.owner?.name || "",
      contact: newProperty.owner?.phone || "",
      email: newProperty.owner?.email,
    },
    createdAt: newProperty.createdAt,
    updatedAt: newProperty.updatedAt,
  }
}

// Mock data for properties
const mockProperties: Property[] = [
  {
    id: "1",
    title: "Luxury Apartment in Downtown",
    type: "Apartment",
    price: "$2000000",
    location: "boul kerk, Phnom Penh",
    bedrooms: 4,
    bathrooms: 3,
    image: "/property-image.jpg",
    description: "A beautiful luxury apartment in the heart of downtown.",
    features: ["Air Conditioning", "Parking", "Swimming Pool", "Gym"],
    owner: {
      name: "John Doe",
      contact: "0987654321",
      email: "john@example.com",
    },
    createdAt: "2023-01-15",
    updatedAt: "2023-04-20",
  },
  // More properties would be added here
]

// Get all properties with optional filtering
export async function getProperties(filters?: {
  type?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  location?: string
}): Promise<Property[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  let filteredProperties = [...mockProperties]

  if (filters) {
    if (filters.type) {
      filteredProperties = filteredProperties.filter((p) => p.type === filters.type)
    }

    if (filters.location) {
      filteredProperties = filteredProperties.filter((p) =>
        p.location.toLowerCase().includes(filters.location!.toLowerCase()),
      )
    }

    if (filters.minPrice) {
      filteredProperties = filteredProperties.filter(
        (p) => Number.parseInt(p.price.replace(/\D/g, "")) >= filters.minPrice!,
      )
    }

    if (filters.maxPrice) {
      filteredProperties = filteredProperties.filter(
        (p) => Number.parseInt(p.price.replace(/\D/g, "")) <= filters.maxPrice!,
      )
    }

    if (filters.bedrooms) {
      filteredProperties = filteredProperties.filter((p) => p.bedrooms >= filters.bedrooms!)
    }
  }

  return filteredProperties
}

// Get a single property by ID
export async function getPropertyById(id: string): Promise<Property | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const property = mockProperties.find((p) => p.id === id)
  return property || null
}

// Get properties by type
export async function getPropertiesByType(type: string): Promise<Property[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockProperties.filter((p) => p.type.toLowerCase() === type.toLowerCase())
}

// Get new listings (most recently added)
export async function getNewListings(limit = 3): Promise<Property[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Sort by createdAt date and take the most recent ones
  return [...mockProperties]
    .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
    .slice(0, limit)
}
