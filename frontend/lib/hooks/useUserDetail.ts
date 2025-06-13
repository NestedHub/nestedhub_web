// lib/hooks/useUserDetail.ts
import { useState, useEffect } from 'react';
import { fetchUserById } from '@/lib/utils/api';

export interface UserDetail {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  id_card_url: string | null;
  profile_picture_url: string | null;
  is_email_verified: boolean;
  is_approved: boolean;
  is_active: boolean;
}

interface UseUserDetailResult {
  user: UserDetail | null;
  isLoadingUser: boolean;
  errorUser: string | null;
}

export function useUserDetail(userId: number | undefined): UseUserDetailResult {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState<string | null>(null);

  useEffect(() => {
    if (userId === undefined || userId === null) {
      setUser(null);
      setIsLoadingUser(false);
      setErrorUser("User ID is missing.");
      return;
    }

    const getUser = async () => {
      setIsLoadingUser(true);
      setErrorUser(null);
      try {
        const data = await fetchUserById(userId);
        setUser(data);
      } catch (err: any) {
        console.error("Failed to fetch user details:", err);
        setErrorUser(err.message || 'An unknown error occurred fetching user details');
      } finally {
        setIsLoadingUser(false);
      }
    };

    getUser();
  }, [userId]);

  return { user, isLoadingUser, errorUser };
}