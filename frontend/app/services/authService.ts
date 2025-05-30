interface LoginCredentials {
  username: string;
  password: string;
}

interface BackendLoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    role: 'user' | 'propertyowner' | 'admin';
  };
}

interface ErrorResponse {
  detail?: string;
  message?: string;
}

export const loginService = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    // Full API endpoint URL
    const apiUrl = 'http://localhost:8000';
    console.log('Using API URL:', apiUrl);

    // Ensure trailing slash in API URL
    const endpoint = `${apiUrl.replace(/\/$/, '')}/api/users/login`;
    console.log('Full endpoint:', endpoint);

    // Add credentials to request body
    const credentials = {
      username: email,
      password,
    };

    console.log('Login request:', credentials);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include',
      body: new URLSearchParams(credentials),
    });

    // Log the response status for debugging
    console.log('Login response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' })) as ErrorResponse;
      console.error('API error response:', errorData);
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    console.log('Login response data:', data);

    if (!data.access_token || !data.refresh_token || !data.token_type) {
      console.error('Invalid response data structure:', data);
      throw new Error('Invalid response data format');
    }

    // Extract user information from the access token
    try {
      // First try to get user info from token payload
      const tokenParts = data.access_token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format:', data.access_token);
        throw new Error('Invalid token format');
      }

      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      console.log('Token payload:', tokenPayload);
      
      if (!tokenPayload.email || !tokenPayload.role || !tokenPayload.sub) {
        console.error('Invalid token payload:', tokenPayload);
        throw new Error('Invalid token payload');
      }

      // Map backend role to frontend role
      const roleMap: Record<string, 'user' | 'propertyowner' | 'admin'> = {
        'customer': 'user',
        'property_owner': 'propertyowner',  // Updated to match backend format
        'admin': 'admin'
      };

      const mappedRole = roleMap[tokenPayload.role as keyof typeof roleMap];
      if (!mappedRole) {
        console.error('Unknown role:', tokenPayload.role);
        throw new Error('Invalid user role');
      }

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type,
        user: {
          id: tokenPayload.sub,
          email: tokenPayload.email,
          role: mappedRole
        }
      } as LoginResponse;
    } catch (tokenError) {
      console.error('Error parsing token:', tokenError);
      throw new Error('Invalid token format');
    }
  } catch (error) {
    console.error('Login service error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during login');
  }
};
