// Auth API client

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
    console.warn('NEXT_PUBLIC_API_URL is not set, using default Docker service URL');
    return 'http://localhost:8000';  // Docker service URL
  }
  return url;
};

const API_URL = getApiUrl();

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('Attempting login to:', API_URL); // Debug log
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid email or password');
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Login failed. Please try again.');
      }

      const data = await response.json();
      
      // Store user data in localStorage for persistence
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Clear stored user data
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove user data even if API call fails
      localStorage.removeItem('user');
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error('Failed to get current user');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
}; 