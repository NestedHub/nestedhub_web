// lib/utils/wishlist-api.ts
import { WishListResponse } from "@/lib/types";
import { getAccessToken, clearTokens } from "@/lib/utils/user-api";

// Define a constant for the API base URL.
// It tries to get it from environment variables first,
// and falls back to a default development URL if not set.
// This is executed once when the module is loaded.
const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Log the resolved API_BASE_URL
console.log(`[wishlist-api.ts] API_BASE_URL resolved to: ${API_BASE_URL}`);

// Helper for authenticated requests
export async function fetchAuthenticated<T>(
  endpoint: string,
  method: string, // Add 'method' as a parameter to distinguish requests
  body?: object | URLSearchParams,
  isFormData: boolean = false
): Promise<T | null> {
  const token = getAccessToken();

  if (!token) {
    console.warn(
      `[fetchAuthenticated] Attempted authenticated request to ${endpoint} without a token. Returning null.`
    ); // Do NOT throw here, return null, as useUser handles auth state
    return null;
  }

  const headers: HeadersInit = isFormData
    ? { Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = isFormData ? (body as FormData) : JSON.stringify(body);
  }

  // Use the pre-defined API_BASE_URL constant
  // No need for 'apiBaseUrl' variable here, just use API_BASE_URL directly
  // The check for API_BASE_URL being defined is now implicitly handled by the fallback
  // or will result in an empty string if both env var and fallback are empty (unlikely with this setup)
  if (!API_BASE_URL) {
    // This case should ideally not be hit with the fallback, but kept for extreme caution
    console.error(
      "[fetchAuthenticated] Fatal: API_BASE_URL is still not defined even after fallback attempt."
    );
    throw new Error("API base URL is not configured.");
  }

  const fullUrl = `${API_BASE_URL}/api/${endpoint}`; // Changed `apiBaseUrl` to `API_BASE_URL`
  console.log(`[fetchAuthenticated] Making ${method} request to: ${fullUrl}`);
  console.log(`[fetchAuthenticated] Request config:`, config);

  try {
    const response = await fetch(fullUrl, config);

    console.log(
      `[fetchAuthenticated] Response status for ${fullUrl}: ${response.status}`
    );

    if (response.status === 401 || response.status === 403) {
      console.error(
        "[fetchAuthenticated] Authentication failed or token expired. Clearing tokens."
      );
      clearTokens();
      throw new Error("Unauthorized: Token invalid or expired."); // Re-throw to propagate error for UI
    }

    if (method === "DELETE" && response.status === 404) {
      console.warn(
        `[fetchAuthenticated] DELETE request to ${fullUrl} returned 404. Assuming resource was already absent/deleted. Treating as success.`
      );
      return null; // Treat as a successful "no content" operation for DELETE
    }

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
        console.error(
          `[fetchAuthenticated] API error JSON response for ${fullUrl}:`,
          errorData
        );
      } catch (jsonError) {
        // If response is not JSON, get it as text for better debugging
        const responseText = await response.text();
        errorData.message = responseText || response.statusText;
        console.error(
          `[fetchAuthenticated] API error: Non-JSON response for ${fullUrl}. Status text: ${response.statusText}. Raw response: ${responseText}`
        );
      }
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    if (response.status === 204) {
      console.log(
        `[fetchAuthenticated] Received 204 No Content for ${fullUrl}. Returning null.`
      );
      return null;
    }

    const data = await response.json();
    console.log(
      `[fetchAuthenticated] Successful response data for ${fullUrl}:`,
      data
    );
    return data;
  } catch (error: any) {
    console.error(
      `[fetchAuthenticated] Caught error during fetch to ${fullUrl}:`,
      error
    );
    throw error; // Re-throw other errors to be handled by the calling hook/component
  }
}

/**
 * Adds a property to the user's wishlist.
 * @param property_id The ID of the property to add.
 * @returns WishListResponse object or null if unauthorized.
 */
export async function addPropertyToWishlist(
  property_id: number
): Promise<WishListResponse | null> {
  console.log(`[wishlist-api] Calling addPropertyToWishlist for ID: ${property_id}`);
  return fetchAuthenticated<WishListResponse>(
    `wishlist/`, // Ensure this matches your backend's path after /api/
    "POST",
    { property_id }
  );
}

/**
 * Retrieves all properties in the current user's wishlist.
 * @returns List of WishListResponse objects or null if unauthorized.
 */
export async function getUserWishlist(): Promise<WishListResponse[] | null> {
  console.log(`[wishlist-api] Calling getUserWishlist`);
  return fetchAuthenticated<WishListResponse[]>(
    `wishlist/`, // Ensure this matches your backend's path after /api/
    "GET"
  );
}

/**
 * Removes a specific property from the user's wishlist.
 * @param property_id The ID of the property to remove.
 * @returns void or null if unauthorized.
 */
export async function removePropertyFromWishlist(
  property_id: number
): Promise<void | null> {
  console.log(`[wishlist-api] Calling removePropertyFromWishlist for ID: ${property_id}`);
  // We're expecting `void` for a successful deletion, so the generic type is void
  return fetchAuthenticated<void>(
    `wishlist/${property_id}`, // Ensure this matches your backend's path after /api/
    "DELETE"
  );
}

/**
 * Clears all properties from the user's wishlist.
 * @returns void or null if unauthorized.
 */
export async function clearWishlist(): Promise<void | null> {
  console.log(`[wishlist-api] Calling clearWishlist`);
  return fetchAuthenticated<void>(
    `wishlist/`, // Ensure this matches your backend's path after /api/
    "DELETE"
  );
}