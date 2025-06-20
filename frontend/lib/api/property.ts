import { getAuthHeaders } from './auth';

export interface PropertyImage {
  image_id: number;
  image_url: string;
  is_primary: boolean;
}

export interface Feature {
  feature_id: number;
  feature_name: string;
}

export interface Property {
  property_id: number;
  title: string;
  description: string;
  rent_price: number;
  address: string;
  city: string;
  district: string;
  commune: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  floor_area: number;
  status: 'pending' | 'available' | 'rented' | 'hidden';
  category: string;
  features: Feature[];
  images: PropertyImage[];
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface PropertySearchParams {
  keyword?: string;
  city_id?: number;
  district_id?: number;
  commune_id?: number;
  category_id?: number;
  status?: 'pending' | 'available' | 'rented' | 'hidden';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  offset?: number;
  limit?: number;
}

export interface PropertyUpdateParams {
    title?: string;
    description?: string;
    rent_price?: number;
    bedrooms?: number;
    bathrooms?: number;
    floor_area?: number;
    status?: 'pending' | 'available' | 'rented' | 'hidden';
}

export interface PropertyCountResponse {
  total_properties: number;
  available_properties: number;
  rented_properties: number;
  pending_properties: number;
}


export const propertyApi = {
  // Search for properties
  searchProperties: async (params: PropertySearchParams = {}): Promise<{ items: Property[], total: number }> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/properties?${queryParams.toString()}`,
      {
        headers: getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search properties');
    }

    const data = await response.json();
    // Normalize for different backend shapes
    if ('properties' in data && 'total' in data) {
      return { items: data.properties, total: data.total };
    }
    if (Array.isArray(data)) {
      return { items: data, total: data.length };
    }
    if ('items' in data && 'total' in data) {
      return data;
    }
    if ('results' in data && 'count' in data) {
      return { items: data.results, total: data.count };
    }
    // fallback
    return { items: [], total: 0 };
  },

  // Get a single property by ID
  getProperty: async (propertyId: number): Promise<Property> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${propertyId}`,
      {
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch property');
    }

    return response.json();
  },

  // Update a property
  updateProperty: async (propertyId: number, data: PropertyUpdateParams): Promise<Property> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${propertyId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        credentials: 'include',
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update property');
    }

    return response.json();
  },

  // Get property counts
  getPropertyCounts: async (): Promise<PropertyCountResponse> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/properties/count`,
      {
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch property counts');
    }
    
    return response.json();
  },

  // Delete a property
  deleteProperty: async (propertyId: number): Promise<void> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${propertyId}`,
      {
        method: 'DELETE',
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete property');
    }
  }
}; 