const BASE_URL ="http://localhost:8000";

export interface PropertyApiResponse {
  total: number
  properties: {
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
    media: {
      media_url: string
      media_type: string
    }[]
    features: {
      feature_id: number
      feature_name: string
    }[]
  }[]
}

interface QueryParams {
  keyword?: string
  city_id?: string
  district_id?: string
  commune_id?: string
  category_id?: string
  sort_by?: string
  sort_order?: string
  limit?: number
  offset?: number
}

export async function fetchProperties(params: QueryParams): Promise<PropertyApiResponse> {
  const query = new URLSearchParams({
    ...params,
    offset: (params.offset ?? 0).toString(),
    limit: (params.limit ?? 10).toString(),
  });

  console.log("Fetching properties from:", `${BASE_URL}/api/properties?${query.toString()}`);


  const response = await fetch(`${BASE_URL}/api/properties?${query.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export async function fetchCurrentUser() {
  const response = await fetch(`${BASE_URL}/api/users/me`, {
    headers: {
      'Content-Type': 'application/json',
      // Add your authentication token here if needed, e.g.:
      // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
  });

  if (response.status === 401) {
    // Not authenticated, return null instead of throwing
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `API error: ${response.status} - ${response.statusText}`);
  }

  return response.json();
}

export async function fetchPropertyById(propertyId: string) {
  const response = await fetch(`${BASE_URL}/api/properties/${propertyId}`, {
    headers: {
      'Content-Type': 'application/json',
      // Add Authorization header here if the property endpoint is protected
      // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Failed to fetch property: ${response.status}`);
  }

  return response.json();
}

export async function fetchReviewsForProperty(propertyId: string) {
  const response = await fetch(`${BASE_URL}/api/reviews/public/property/${propertyId}/reviews`, {
    headers: {
      'Content-Type': 'application/json',
      // Add Authorization header here if reviews endpoint requires it
      // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Failed to fetch reviews: ${response.status}`);
  }

  return response.json();
}

export async function fetchUserById(userId: number) {
  const response = await fetch(`${BASE_URL}/api/users/public/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
      // This endpoint is restricted. You MUST include an Authorization header
      // with a token for an admin or the user themselves.
      // For demonstration, we'll assume a token is available.
      'Authorization': `Bearer ${localStorage.getItem('authToken')}` || '',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Failed to fetch user: ${response.status}`);
  }

  return response.json();
}

export async function createViewingRequest(property_id: number, requested_time: string) {
  const token = localStorage.getItem('authToken'); // Assuming token is stored in localStorage after login
  if (!token) {
    throw new Error('Authentication required: Please log in to book a viewing.');
  }

  const response = await fetch(`${BASE_URL}/api/viewing-requests/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Include the authorization token
    },
    body: JSON.stringify({
      property_id,
      requested_time,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Failed to create viewing request: ${response.statusText}`);
  }

  return response.json();
}

