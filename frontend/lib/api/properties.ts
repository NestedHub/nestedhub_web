// API client for properties

export interface PropertyImage {
  id: string
  url: string
  isPrimary?: boolean
}

export interface Property {
  id: string
  title: string
  type: string
  price: string
  location: string
  bedrooms: number
  bathrooms: number
  image: string
}

export interface PropertyResponse {
  items: Property[]
  total: number
  page: number
  per_page: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function fetchProperties(params: {
  type?: string
  limit?: number
  page?: number
  sort?: string
  order?: 'asc' | 'desc'
}) {
  const searchParams = new URLSearchParams()
  if (params.type) searchParams.append('type', params.type)
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.sort) searchParams.append('sort', params.sort)
  if (params.order) searchParams.append('order', params.order)

  const response = await fetch(`${API_URL}/api/properties?${searchParams.toString()}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch properties')
  }

  return response.json() as Promise<PropertyResponse>
}

export async function fetchNewListings(limit = 6) {
  return fetchProperties({ sort: 'createdAt', order: 'desc', limit })
}

export async function fetchPropertiesByType(type: string, limit = 6) {
  return fetchProperties({ type, limit })
} 