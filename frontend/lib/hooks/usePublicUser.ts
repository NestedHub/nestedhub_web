// lib/hooks/usePublicUser.ts
import { useState, useEffect } from 'react';
import { fetchUserById } from '@/lib/utils/api';
import { PublicUser } from '@/lib/types';

interface UsePublicUserResult {
  publicUser: PublicUser | null;
  isLoadingPublicUser: boolean;
  errorPublicUser: string | null;
}

export function usePublicUser(userId: number | undefined): UsePublicUserResult {
  const [publicUser, setPublicUser] = useState<PublicUser | null>(null);
  const [isLoadingPublicUser, setIsLoadingPublicUser] = useState(true);
  const [errorPublicUser, setErrorPublicUser] = useState<string | null>(null);

  useEffect(() => {
    // If no userId is provided, reset state and return
    if (typeof userId === 'undefined' || userId === null) {
      setPublicUser(null);
      setIsLoadingPublicUser(false);
      setErrorPublicUser(null);
      return;
    }

    const getUser = async () => {
      setIsLoadingPublicUser(true);
      setErrorPublicUser(null);
      try {
        const data = await fetchUserById(userId);
        setPublicUser(data); // data will be PublicUser | null
      } catch (err: any) {
        console.error("Failed to fetch public user details:", err);
        setErrorPublicUser(err.message || 'An unknown error occurred fetching public user details');
      } finally {
        setIsLoadingPublicUser(false);
      }
    };

    getUser();
  }, [userId]); // Re-fetch if userId changes

  return { publicUser, isLoadingPublicUser, errorPublicUser };
}