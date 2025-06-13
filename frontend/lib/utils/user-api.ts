// lib/utils/user-api.ts

import {
  UserResponse,
  TokenResponse,
  GoogleAuthUrlResponse,
  UserCreate,
  UserUpdate,
  VerifyEmailRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  TokenRevokeRequest,
  SuccessMessageResponse,
  SearchUsersParams,
  ListUsersParams,
  UserRole,
} from "@/lib/user"; // Adjust path as needed

const BASE_URL = "http://localhost:8000/api"; // Your API Base URL

// --- Token Management Helpers (for client-side storage) ---
// IMPORTANT: For production, consider using HttpOnly cookies for JWTs for better security.
// localStorage is used here for simplicity as per your previous examples.

export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
}

export function getRefreshToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken");
  }
  return null;
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }
}

export function clearTokens() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
}

// --- Generic Fetch Helper for Authenticated Requests ---
async function fetchAuthenticated<T>(
  endpoint: string,
  method: string,
  body?: object | URLSearchParams,
  isFormData: boolean = false
): Promise<T> {
  const token = getAccessToken();
  if (!token) {
    // If no token, and it's an authenticated endpoint, redirect or throw
    // For a robust app, dispatch a global logout or redirect to login.
    console.error("Authentication token is missing for authenticated request.");
    clearTokens(); // Clear any potentially stale tokens
    // Consider adding a redirect to login page here or letting the calling hook handle it
    throw new Error("Authentication required: No token found.");
  }

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const options: RequestInit = {
    method,
    headers,
    body: isFormData ? (body as URLSearchParams) : JSON.stringify(body),
  };

  if (method === "GET" && body) {
    const queryParams = new URLSearchParams(
      body as Record<string, any>
    ).toString();
    endpoint = `${endpoint}?${queryParams}`;
    delete options.body; // GET requests should not have a body
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (response.status === 401 || response.status === 403) {
    console.error(
      `Authentication error: ${response.status} - ${response.statusText}`
    );
    clearTokens(); // Clear tokens on auth failure
    throw new Error("Unauthorized or Forbidden. Please re-authenticate.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Attempt to parse JSON error, fallback to empty
    const errorMessage =
      errorData.detail ||
      errorData.message ||
      `API error: ${response.status} - ${response.statusText}`;
    throw new Error(errorMessage);
  }

  // Handle 204 No Content responses (e.g., DELETE operations)
  if (response.status === 204) {
    return null as T; // Explicitly return null for no content
  }

  return response.json() as Promise<T>;
}

// --- Generic Fetch Helper for Unauthenticated Requests ---
async function fetchUnauthenticated<T>(
  endpoint: string,
  method: string,
  body?: object | URLSearchParams,
  isFormData: boolean = false
): Promise<T> {
  const headers: HeadersInit = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const options: RequestInit = {
    method,
    headers,
    body: isFormData ? (body as URLSearchParams) : JSON.stringify(body),
  };

  if (method === "GET" && body) {
    const queryParams = new URLSearchParams(
      body as Record<string, any>
    ).toString();
    endpoint = `${endpoint}?${queryParams}`;
    delete options.body; // GET requests should not have a body
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.detail ||
      errorData.message ||
      `API error: ${response.status} - ${response.statusText}`;
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

// --- API Functions ---

// 1. Search Users (Admin Only)
export async function searchUsers(
  params: SearchUsersParams
): Promise<UserResponse[]> {
  return fetchAuthenticated<UserResponse[]>("/users/search", "GET", params);
}

// 2. Google Login
export async function googleLogin(): Promise<GoogleAuthUrlResponse> {
  return fetchUnauthenticated<GoogleAuthUrlResponse>(
    "/users/google/login",
    "GET"
  );
}

// 3. Google OAuth2 Callback
export async function googleCallback(code: string): Promise<TokenResponse> {
  const params = new URLSearchParams({ code });
  return fetchUnauthenticated<TokenResponse>(
    `/users/google/callback?${params.toString()}`,
    "GET"
  );
}

// 4. Register User
export async function registerUser(
  userData: UserCreate
): Promise<UserResponse> {
  return fetchUnauthenticated<UserResponse>(
    "/users/register",
    "POST",
    userData
  );
}

// 5. Login User
export async function loginUser(
  email: string,
  password: string
): Promise<TokenResponse> {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);
  return fetchUnauthenticated<TokenResponse>(
    "/users/login",
    "POST",
    formData,
    true
  );
}

// 6. Verify Email
export async function verifyEmail(
  data: VerifyEmailRequest
): Promise<TokenResponse> {
  return fetchUnauthenticated<TokenResponse>(
    "/users/verify-email",
    "POST",
    data
  );
}

// 7. Request Password Reset
export async function requestPasswordReset(
  data: PasswordResetRequest
): Promise<SuccessMessageResponse> {
  return fetchUnauthenticated<SuccessMessageResponse>(
    "/users/password-reset-request",
    "POST",
    data
  );
}

// 8. Confirm Password Reset
export async function confirmPasswordReset(
  data: PasswordResetConfirm
): Promise<SuccessMessageResponse> {
  return fetchUnauthenticated<SuccessMessageResponse>(
    "/users/password-reset",
    "POST",
    data
  );
}

// 9. Revoke Token (Authenticated)
export async function revokeToken(
  data: TokenRevokeRequest
): Promise<SuccessMessageResponse> {
  return fetchAuthenticated<SuccessMessageResponse>(
    "/users/token/revoke",
    "POST",
    data
  );
}

// 10. Get Current User Info (Authenticated)
export async function getCurrentUser(): Promise<UserResponse> {
  return fetchAuthenticated<UserResponse>("/users/me", "GET");
}

// 11. Get User by ID (Authenticated - Admin or self)
export async function getUserById(userId: number): Promise<UserResponse> {
  return fetchAuthenticated<UserResponse>(`/users/${userId}`, "GET");
}

// 12. Approve User (Admin Only)
export async function approveUser(userId: number): Promise<UserResponse> {
  return fetchAuthenticated<UserResponse>(`/users/${userId}/approve`, "PATCH");
}

// 13. Reject Property Owner (Admin Only)
export async function rejectPropertyOwner(
  userId: number
): Promise<SuccessMessageResponse> {
  return fetchAuthenticated<SuccessMessageResponse>(
    `/users/${userId}/reject`,
    "DELETE"
  );
}

// 14. Get Pending Approvals (Admin Only)
export async function getPendingApprovals(): Promise<UserResponse[]> {
  return fetchAuthenticated<UserResponse[]>("/users/pending-approvals", "GET");
}

// 15. Update User (Authenticated - Admin or self)
export async function updateUser(
  userId: number,
  userData: UserUpdate
): Promise<UserResponse> {
  return fetchAuthenticated<UserResponse>(`/users/${userId}`, "PUT", userData);
}

// 16. List Users (Admin Only)
export async function listUsers(
  params: ListUsersParams = {}
): Promise<UserResponse[]> {
  return fetchAuthenticated<UserResponse[]>("/users/", "GET", params);
}

// 17. Delete User (Admin Only - Soft or Hard Delete)
export async function deleteUser(
  userId: number,
  hard_delete: boolean = false
): Promise<SuccessMessageResponse> {
  const query = new URLSearchParams({ hard_delete: String(hard_delete) });
  return fetchAuthenticated<SuccessMessageResponse>(
    `/users/${userId}?${query.toString()}`,
    "DELETE"
  );
}

// 18. Ban/Unban User (Admin Only)
export async function banUnbanUser(
  userId: number,
  ban: boolean = true
): Promise<UserResponse> {
  const query = new URLSearchParams({ ban: String(ban) });
  return fetchAuthenticated<UserResponse>(
    `/users/${userId}/ban?${query.toString()}`,
    "PATCH"
  );
}
