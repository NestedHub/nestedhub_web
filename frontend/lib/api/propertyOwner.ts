import { getAuthHeaders } from './auth';

// Dashboard data for property owner
export const propertyOwnerApi = {
  // Fetch dashboard data for the logged-in property owner
  getDashboard: async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/property-owner/dashboard`,
      {
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    return response.json();
  },

  // Fetch all properties owned by the logged-in property owner
  getMyProperties: async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/properties/my-listings`,
      {
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    );
    if (!response.ok) {
      let errorMsg = 'Failed to fetch properties';
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorMsg += ': ' + JSON.stringify(errorData.detail);
        }
      } catch (e) {
        // ignore
      }
      console.error('getMyProperties error:', errorMsg);
      throw new Error(errorMsg);
    }
    const data = await response.json();
    // Normalize for different backend shapes
    if (Array.isArray(data)) {
      return { properties: data };
    }
    if ('properties' in data) {
      return { properties: data.properties };
    }
    if ('items' in data) {
      return { properties: data.items };
    }
    if ('results' in data) {
      return { properties: data.results };
    }
    // fallback
    return { properties: [] };
  },

  // Fetch owner settings
  getSettings: async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/property-owner/settings`,
      {
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    return response.json();
  },

  // Update owner settings
  updateSettings: async (data: any) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/property-owner/settings`,
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
      throw new Error('Failed to update settings');
    }
    return response.json();
  },

  // Request to become a property owner (signup)
  requestSignup: async (data: any) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/property-owner/signup`,
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
      throw new Error('Failed to request property owner signup');
    }
    return response.json();
  },

  // Logout for property owner
  logout: async (token: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/revoke`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        credentials: 'include',
        body: JSON.stringify({ token }),
      }
    );
    if (!response.ok) {
      throw new Error('Logout failed');
    }
  },

  // Upload image to Cloudinary
  uploadImageToCloudinary: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    return response.json();
  },
}; 