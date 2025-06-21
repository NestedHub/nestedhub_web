import { getAuthHeaders } from './auth';
import { Property } from '@/lib/types';

export interface PropertySearchParams {
  keyword?: string;
  city_id?: number;
  district_id?: number;
  commune_id?: number;
  category_id?: number;
  status?: 'pending' | 'available' | 'rented' | 'hidden';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
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
      if (value !== undefined && value !== null) {
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

    return response.json();
  },

  // Get a single property by ID
  getProperty: async (propertyId: string): Promise<Property> => {
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
  updateProperty: async (propertyId: string, data: PropertyUpdateParams): Promise<Property> => {
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
      const errorData = await response.json().catch(() => ({ detail: 'Failed to update property' }));
      throw new Error(errorData.detail);
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
  deleteProperty: async (propertyId: string): Promise<void> => {
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
  },

  // Get property stats for the current owner
  getOwnerStats: async (): Promise<{ total_owned: number; total_rented: number }> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/properties/stats`,
      {
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch property stats');
    }
    return response.json();
  },

  // Create a new property
  createProperty: async (data: any): Promise<Property> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/properties/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        credentials: 'include',
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to create property' }));
      throw new Error(errorData.detail);
    }
    return response.json();
  },

  getOwnerListings: async (searchTerm?: string): Promise<{ properties: any[] }> => {
    const queryParams = new URLSearchParams();
    if (searchTerm) {
      queryParams.append('keyword', searchTerm);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/properties/my-listings?${queryParams.toString()}`,
      {
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch owner's listings");
    }
    // The backend returns { "properties": [...] }
    return response.json();
  },
}; 