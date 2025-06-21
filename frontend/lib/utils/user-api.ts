// lib/utils/user-api.ts
// Updated: June 21, 2025

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

// IMPORTANT: Ensure this matches your FastAPI backend's base URL.
// Use environment variables for production (e.g., process.env.NEXT_PUBLIC_API_BASE_URL)
let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

if (!baseUrl.endsWith("/api")) {
  baseUrl = `${baseUrl.replace(/\/+$/, "")}/api`;
}

const BASE_URL = baseUrl;

// Cloudinary Configuration (Publicly accessible keys for direct unsigned upload)
// IMPORTANT: CLOUDINARY_API_SECRET MUST NOT BE EXPOSED ON THE CLIENT-SIDE.
// For production, use signed uploads where a backend generates a signature.
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

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
export async function fetchAuthenticated<T>(
  endpoint: string,
  method: string,
  body?: object | URLSearchParams,
  isFormData: boolean = false
): Promise<T> {
  const token = getAccessToken();
  if (!token) {
    console.error("Authentication token is missing for authenticated request.");
    clearTokens(); // Ensure any stale tokens are removed
    throw new Error("Authentication required: No token found.");
  }

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  let finalEndpoint = `${BASE_URL}${endpoint}`;
  let finalBody: BodyInit | undefined = isFormData ? (body as URLSearchParams) : JSON.stringify(body);

  if (method === "GET" && body) {
    const queryParams = new URLSearchParams(
      body as Record<string, any>
    ).toString();
    finalEndpoint = `${finalEndpoint}?${queryParams}`;
    finalBody = undefined; // GET requests should not have a body
  }

  const options: RequestInit = {
    method,
    headers,
    body: finalBody,
  };

  const response = await fetch(finalEndpoint, options);

  if (response.status === 401 || response.status === 403) {
    console.error(
      `Authentication error: ${response.status} - ${response.statusText}. Attempting to re-authenticate.`
    );
    clearTokens(); // Clear tokens on unauthorized/forbidden to force re-login
    throw new Error("Unauthorized or Forbidden. Please re-authenticate.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.detail ||
      errorData.message ||
      `API error: ${response.status} - ${response.statusText}`;
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null as T; // No content for 204
  }

  return response.json() as Promise<T>;
}

// --- Generic Fetch Helper for Unauthenticated Requests ---
export async function fetchUnauthenticated<T>(
  endpoint: string,
  method: string,
  body?: object | URLSearchParams,
  isFormData: boolean = false
): Promise<T> {
  const headers: HeadersInit = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  let finalEndpoint = `${BASE_URL}${endpoint}`;
  let finalBody: BodyInit | undefined = isFormData ? (body as URLSearchParams) : JSON.stringify(body);

  if (method === "GET" && body) {
    const queryParams = new URLSearchParams(
      body as Record<string, any>
    ).toString();
    finalEndpoint = `${finalEndpoint}?${queryParams}`;
    finalBody = undefined; // GET requests should not have a body
  }

  const options: RequestInit = {
    method,
    headers,
    body: finalBody,
  };

  const response = await fetch(finalEndpoint, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.detail ||
      errorData.message ||
      `API error: ${response.status} - ${response.statusText}`;
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null as T; // No content for 204
  }

  return response.json() as Promise<T>;
}

// --- File Upload Helper (Cloudinary) ---
/**
 * Uploads a file to Cloudinary.
 * IMPORTANT: This uses direct unsigned upload. For production, consider using
 * signed uploads where a backend generates a secure signature.
 * @param file The file to upload.
 * @returns The secure URL of the uploaded file.
 */
export async function uploadFileToCloudinary(file: File): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY) {
    throw new Error("Cloudinary environment variables are not set.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "your_upload_preset"); // <<< IMPORTANT: Replace with your Cloudinary upload preset
  formData.append("api_key", CLOUDINARY_API_KEY);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error?.message || `Cloudinary upload failed: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.secure_url;
}


// --- API Functions ---

export async function searchUsers(
  params: SearchUsersParams
): Promise<UserResponse[]> {
  return fetchAuthenticated<UserResponse[]>("/users/search", "GET", params);
}

export async function googleLogin(): Promise<GoogleAuthUrlResponse> {
  return fetchUnauthenticated<GoogleAuthUrlResponse>(
    "/users/google/login",
    "GET"
  );
}

// !!! IMPORTANT: The googleCallback function is REMOVED from the frontend
// !!! It is now handled entirely by your backend.
// export async function googleCallback(code: string): Promise<TokenResponse> {
//   // This function is no longer called by the frontend for Google OAuth.
//   // Your backend directly receives the 'code' and redirects with tokens.
//   throw new Error("Frontend googleCallback(code) is deprecated. Backend handles code exchange.");
// }

export async function registerUser(
  userData: UserCreate
): Promise<UserResponse> {
  return fetchUnauthenticated<UserResponse>(
    "/users/register",
    "POST",
    userData
  );
}

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
    true // Indicate formData
  );
}

export async function verifyEmail(
  data: VerifyEmailRequest
): Promise<TokenResponse> {
  return fetchUnauthenticated<TokenResponse>(
    "/users/verify-email",
    "POST",
    data
  );
}

export async function requestPasswordReset(
  data: PasswordResetRequest
): Promise<SuccessMessageResponse> {
  return fetchUnauthenticated<SuccessMessageResponse>(
    "/users/password-reset-request",
    "POST",
    data
  );
}

export async function confirmPasswordReset(
  data: PasswordResetConfirm
): Promise<SuccessMessageResponse> {
  return fetchUnauthenticated<SuccessMessageResponse>(
    "/users/password-reset",
    "POST",
    data
  );
}

export async function revokeToken(
  data: TokenRevokeRequest
): Promise<SuccessMessageResponse> {
  return fetchAuthenticated<SuccessMessageResponse>(
    "/users/token/revoke",
    "POST",
    data
  );
}

export async function getCurrentUser(): Promise<UserResponse> {
  return fetchAuthenticated<UserResponse>("/users/me", "GET");
}

export async function getUserById(userId: number): Promise<UserResponse> {
  return fetchAuthenticated<UserResponse>(`/users/${userId}`, "GET");
}

export async function approveUser(userId: number): Promise<UserResponse> {
  return fetchAuthenticated<UserResponse>(`/users/${userId}/approve`, "PATCH");
}

export async function rejectPropertyOwner(
  userId: number
): Promise<SuccessMessageResponse> {
  return fetchAuthenticated<SuccessMessageResponse>(
    `/users/${userId}/reject`,
    "DELETE"
  );
}

export async function getPendingApprovals(): Promise<UserResponse[]> {
  return fetchAuthenticated<UserResponse[]>("/users/pending-approvals", "GET");
}

export async function updateUser(
  userId: number,
  userData: UserUpdate
): Promise<UserResponse> {
  return fetchAuthenticated<UserResponse>(`/users/${userId}`, "PUT", userData);
}

export async function listUsers(
  params: ListUsersParams = {}
): Promise<UserResponse[]> {
  return fetchAuthenticated<UserResponse[]>("/users/", "GET", params);
}

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