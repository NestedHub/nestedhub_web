// Auth API client
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  role: 'customer' | 'property_owner' | 'admin';
  name: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// Get the API URL from environment variable
const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    console.warn('NEXT_PUBLIC_API_URL is not set, using default URL');
    return 'http://localhost:8000';
  }
  return url;
};

const API_URL = getApiUrl();

// Helper function to get auth token
export const getAuthToken = () => {
  return Cookies.get('auth_token');
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) {
    // Try to get token from localStorage as fallback
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.token) {
        return {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userData.token}`,
        };
      }
    }
    throw new Error('No authentication token found');
  }
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
    });
    throw new Error(errorData?.message || `API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('Login attempt for:', email);
      console.log('API URL:', API_URL);

      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Login error response:', errorData);
        throw new Error(errorData.message || `Login failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Login response data:', data);

      if (!data.access_token || !data.user) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }

      // Store the tokens in cookies
      Cookies.set('auth_token', data.access_token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Logout failed:', response.status);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear stored data
      localStorage.removeItem('user');
      Cookies.remove('auth_token');
      Cookies.remove('user');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid auth state
          localStorage.removeItem('user');
          Cookies.remove('auth_token');
          Cookies.remove('user');
        }
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
}; 