import { getAuthHeaders } from './auth';

export interface User {
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'customer' | 'property_owner' | 'admin';
  id_card_url: string | null;
  profile_picture_url: string | null;
  is_email_verified: boolean;
  is_approved: boolean;
  is_active: boolean;
}

export interface UserSearchParams {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'customer' | 'property_owner' | 'admin';
  is_active?: boolean;
  is_approved?: boolean;
  skip?: number;
  limit?: number;
}

export const userApi = {
  // List users with pagination and filters
  listUsers: async (params: UserSearchParams = {}): Promise<User[]> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users?${queryParams.toString()}`,
      {
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  },

  // Get all users without pagination for counting
  listAllUsers: async (params: Omit<UserSearchParams, 'skip' | 'limit'> = {}): Promise<User[]> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users?${queryParams.toString()}`,
      {
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  },

  // Get dashboard stats (for accurate counts)
  getDashboardStats: async (): Promise<{ totalUsers: number; totalPropertyOwners: number }> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/stats`,
      {
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  },

  // Get user by ID
  getUser: async (userId: number): Promise<User> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
      {
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  },

  // Delete user
  deleteUser: async (userId: number, hardDelete: boolean = false): Promise<void> => {
    const queryParams = new URLSearchParams();
    if (hardDelete) {
      queryParams.append('hard_delete', 'true');
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}?${queryParams.toString()}`,
      {
        method: 'DELETE',
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  },

  // Ban/Unban user
  toggleUserBan: async (userId: number, ban: boolean): Promise<User> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/ban?ban=${ban}`,
      {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(ban ? 'Failed to ban user' : 'Failed to unban user');
    }

    return response.json();
  },

  // Approve property owner
  approvePropertyOwner: async (userId: number): Promise<User> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/approve`,
      {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to approve property owner');
    }

    return response.json();
  },

  // Reject property owner
  rejectPropertyOwner: async (userId: number): Promise<void> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/reject`,
      {
        method: 'DELETE',
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to reject property owner');
    }
  },

  // Get pending property owner approvals
  getPendingApprovals: async (): Promise<User[]> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/pending-approvals`,
      {
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch pending approvals');
    }

    return response.json();
  },
}; 