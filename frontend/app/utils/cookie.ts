export const setAuthCookie = (authState: {
  user: {
    id: string;
    email: string;
    role: 'user' | 'propertyowner' | 'admin';
  };
  token: string;
}) => {
  const authData = JSON.stringify(authState);
  document.cookie = `auth_token=${encodeURIComponent(authData)}; path=/; max-age=${60 * 60 * 24 * 7}; ${process.env.NODE_ENV === 'production' ? 'secure;' : ''} samesite=strict`;
};

export const removeAuthCookie = () => {
  document.cookie = 'auth_token=; path=/; max-age=0';
};

export const getAuthCookie = () => {
  const cookie = document.cookie.split('; ').find(row => row.startsWith('auth_token='));
  if (!cookie) return null;
  
  try {
    const authData = cookie.split('=')[1];
    return decodeURIComponent(authData);
  } catch (error) {
    console.error('Error decoding auth cookie:', error);
    return null;
  }
};
