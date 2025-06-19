// viewingRequestsApi.ts

// --- Type Definitions ---
export interface ViewingRequestResponse {
  request_id: number;
  user_id: number;
  property_id: number;
  requested_time: string; // ISO 8601 string
  status: 'pending' | 'accepted' | 'denied';
  created_at: string; // ISO 8601 string
  message?: string; // ADDED: Optional message string
}

export interface ViewingRequestCreate {
  property_id: number;
  requested_time: string; // ISO 8601 string
  message?: string; // ADDED: Optional message string
}

export interface ViewingRequestUpdate {
  requested_time?: string; // ISO 8601 string
  status?: 'pending' | 'accepted' | 'denied'; // Optional, might be restricted by role
  message?: string; // ADDED: Optional message string
}

export interface SuccessMessageResponse {
  message: string;
}

// --- Import your existing authenticated fetch helper ---
// IMPORTANT: Adjust this import path based on where your user-api.ts file is located
import { fetchAuthenticated } from '@/lib/utils/user-api';

// --- Specific API Endpoints (now using fetchAuthenticated) ---

/**
 * Creates a new viewing request. Restricted to customers.
 * @param data The viewing request creation data.
 */
export const createViewingRequest = (data: ViewingRequestCreate): Promise<ViewingRequestResponse> => {
  return fetchAuthenticated<ViewingRequestResponse>('/viewing-requests/', 'POST', data);
};

/**
 * Retrieves all viewing requests made by the current user. Restricted to customers.
 */
export const getUserViewingRequests = (): Promise<ViewingRequestResponse[]> => {
  // No body needed for GET requests unless there are query parameters
  return fetchAuthenticated<ViewingRequestResponse[]>('/viewing-requests/', 'GET');
};

/**
 * Retrieves upcoming viewing requests for the current user. Restricted to customers.
 */
export const getUserUpcomingViewingRequests = (): Promise<ViewingRequestResponse[]> => {
  return fetchAuthenticated<ViewingRequestResponse[]>('/viewing-requests/upcoming', 'GET');
};

/**
 * Updates an existing viewing request (e.g., requested time or status). Restricted to the customer who created the request.
 * @param requestId The ID of the viewing request to update.
 * @param data The viewing request update data.
 */
export const updateViewingRequest = (requestId: number, data: ViewingRequestUpdate): Promise<ViewingRequestResponse> => {
  return fetchAuthenticated<ViewingRequestResponse>(`/viewing-requests/${requestId}`, 'PATCH', data);
};

/**
 * Deletes a viewing request. Restricted to the customer who created the request.
 * @param requestId The ID of the viewing request to delete.
 */
export const deleteViewingRequest = (requestId: number): Promise<SuccessMessageResponse> => {
  // DELETE requests typically don't have a body. The fetchAuthenticated function handles 204 No Content.
  return fetchAuthenticated<SuccessMessageResponse>(`/viewing-requests/${requestId}`, 'DELETE');
};

/**
 * Accepts a viewing request. Restricted to property owners or admins.
 * @param requestId The ID of the viewing request to accept.
 */
export const acceptViewingRequest = (requestId: number): Promise<ViewingRequestResponse> => {
  return fetchAuthenticated<ViewingRequestResponse>(`/viewing-requests/${requestId}/accept`, 'POST');
};

/**
 * Denies a viewing request. Restricted to property owners or admins.
 * @param requestId The ID of the viewing request to deny.
 */
export const denyViewingRequest = (requestId: number): Promise<ViewingRequestResponse> => {
  return fetchAuthenticated<ViewingRequestResponse>(`/viewing-requests/${requestId}/deny`, 'POST');
};

/**
 * Retrieves all viewing requests for a specific property. Restricted to property owners or admins.
 * @param propertyId The ID of the property.
 */
export const getPropertyViewingRequests = (propertyId: number): Promise<ViewingRequestResponse[]> => {
  return fetchAuthenticated<ViewingRequestResponse[]>(`/viewing-requests/property/${propertyId}`, 'GET');
};

/**
 * Retrieves all viewing requests for properties owned by the current user. Restricted to property owners or admins.
 */
export const getOwnerViewingRequests = (): Promise<ViewingRequestResponse[]> => {
  return fetchAuthenticated<ViewingRequestResponse[]>('/viewing-requests/owner/requests', 'GET');
};

/**
 * Retrieves upcoming viewing requests for properties owned by the current user. Restricted to property owners or admins.
 */
export const getOwnerUpcomingViewingRequests = (): Promise<ViewingRequestResponse[]> => {
  return fetchAuthenticated<ViewingRequestResponse[]>('/viewing-requests/owner/upcoming', 'GET');
};

/**
 * Retrieves a specific viewing request by ID. Restricted to the customer who created the request.
 * @param requestId The ID of the viewing request.
 */
export const getViewingRequestById = (requestId: number): Promise<ViewingRequestResponse> => {
  return fetchAuthenticated<ViewingRequestResponse>(`/viewing-requests/${requestId}`, 'GET');
};