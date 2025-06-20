// api/reviewFetcher.ts
import { fetchAuthenticated } from "./user-api"; // Adjust the import path as needed

/**
 * @file This file contains the API client functions for interacting with the review endpoints.
 * It defines interfaces for review data structures and asynchronous functions to
 * perform CRUD operations (Create, Read, Update, Delete) on reviews.
 */

// Base URL for the API. In a real application, this would typically come from
// environment variables (e.g., process.env.NEXT_PUBLIC_API_BASE_URL).
const BASE_URL = "http://localhost:8000/api";

/**
 * @enum ReviewStatusEnum
 * @description Enum for the possible statuses of a review, mirroring the backend definition.
 * Values:
 * - pending: The review is awaiting moderation.
 * - approved: The review has been approved and is public.
 * - rejected: The review has been rejected and is not public.
 */
export enum ReviewStatusEnum {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

/**
 * @interface ReviewCreate
 * @description Interface for the data required to create a new review.
 * Properties:
 * - property_id: The ID of the property the review is for (number).
 * - rating: The rating given to the property, typically from 1 to 5 (number).
 * - comment?: An optional text comment for the review (string).
 */
export interface ReviewCreate {
  property_id: number;
  rating: number; // 1-5
  comment?: string; // Optional
}

/**
 * @interface ReviewResponse
 * @description Interface for the full review object returned by the API after creation or retrieval.
 * Properties:
 * - review_id: The unique ID of the review (number).
 * - user_id: The ID of the user who created the review (number).
 * - property_id: The ID of the property being reviewed (number).
 * - rating: The rating given to the property (number).
 * - comment?: The text comment for the review (string, optional).
 * - status: The current status of the review, using `ReviewStatusEnum` (string literal).
 * - created_at: The timestamp when the review was created (ISO 8601 string).
 */
export interface ReviewResponse {
  review_id: number;
  user_id: number;
  property_id: number;
  rating: number;
  comment?: string;
  status: ReviewStatusEnum; // Using the new ReviewStatusEnum
  created_at: string; // ISO 8601 string
}

/**
 * @interface ReviewStatusUpdate
 * @description Interface for updating a review's status.
 * Properties:
 * - status: The new status for the review, using `ReviewStatusEnum` (string literal).
 */
export interface ReviewStatusUpdate {
  status: ReviewStatusEnum; // Using the new ReviewStatusEnum
}

// NOTE: The `getAuthHeader` function is no longer directly used by the specific
// fetcher functions below, as `fetchAuthenticated` handles token retrieval internally.
// You can remove it if it's not used elsewhere.
const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  console.log("getAuthHeader: Token retrieved from localStorage:", token);
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * @function createReview
 * @description API call to create a new review for a property.
 * This endpoint typically requires a customer role for authorization.
 * @param {ReviewCreate} reviewData - The data for the new review including `property_id`, `rating`, and an optional `comment`.
 * @returns {Promise<ReviewResponse>} A promise that resolves with the created `ReviewResponse` object.
 * @throws {Error} Throws an error if the network response is not OK (status code 2xx) or if the API returns a specific error message.
 */
export async function createReview(reviewData: ReviewCreate): Promise<ReviewResponse> {
  console.log("API Fetcher: Attempting to create review with data:", reviewData);
  // Using fetchAuthenticated for this POST request
  return fetchAuthenticated<ReviewResponse>('/reviews/', 'POST', reviewData);
}

/**
 * @function fetchMyReviews
 * @description API call to retrieve all reviews made by the currently authenticated user.
 * This endpoint typically requires a customer role for authorization.
 * @returns {Promise<ReviewResponse[]>} A promise that resolves with a list of `ReviewResponse` objects
 * representing reviews made by the current user.
 * @throws {Error} Throws an error if the network response is not OK or if the API returns an error message.
 */
export async function fetchMyReviews(): Promise<ReviewResponse[]> {
  console.log("API Fetcher: Attempting to fetch current user's reviews...");
  // Using fetchAuthenticated for this GET request
  return fetchAuthenticated<ReviewResponse[]>('/reviews/user', 'GET');
}

/**
 * @function fetchReviewsForProperty
 * @description API call to retrieve reviews for a specific property.
 * By default, this endpoint usually returns only "approved" reviews to public users.
 * This function does NOT use fetchAuthenticated because it's a public endpoint.
 * @param {number} propertyId - The ID of the property for which to fetch reviews.
 * @returns {Promise<ReviewResponse[]>} A promise that resolves with a list of `ReviewResponse` objects
 * for the specified property.
 * @throws {Error} Throws an error if the network response is not OK or if the API returns an error message.
 */
export async function fetchReviewsForProperty(propertyId: number): Promise<ReviewResponse[]> {
  console.log(`[API Fetcher] fetchReviewsForProperty: Attempting to fetch reviews for property ID: ${propertyId}`);

  // This is a public endpoint, so it does NOT use fetchAuthenticated.
  // Ensure the URL is correct for your backend.
  const url = `${BASE_URL}/reviews/public/property/${propertyId}/reviews`;

  console.log(`[API Fetcher] fetchReviewsForProperty: Request URL: ${url}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log(`[API Fetcher] fetchReviewsForProperty: Response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Catch JSON parse errors
    console.error(`[API Fetcher] fetchReviewsForProperty: Error response data:`, errorData);
    throw new Error(errorData.detail || `Failed to fetch reviews for property: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`[API Fetcher] fetchReviewsForProperty: Successfully received data:`, data);
  return data;
}

/**
 * @function updateReviewStatus
 * @description API call to update the status of an existing review (e.g., to 'approved' or 'rejected').
 * This endpoint is typically restricted to users with 'admin' or 'property owner' roles.
 * @param {number} reviewId - The ID of the review to update.
 * @param {ReviewStatusUpdate} statusData - An object containing the new status for the review.
 * @returns {Promise<ReviewResponse>} A promise that resolves with the updated `ReviewResponse` object.
 * @throws {Error} Throws an error if the network response is not OK or if the API returns an error message.
 */
export async function updateReviewStatus(reviewId: number, statusData: ReviewStatusUpdate): Promise<ReviewResponse> {
  console.log(`API Fetcher: Attempting to update status for review ID: ${reviewId} to ${statusData.status}`);
  // Using fetchAuthenticated for this PATCH request
  return fetchAuthenticated<ReviewResponse>(`/reviews/${reviewId}/status`, 'PATCH', statusData);
}

/**
 * @function deleteReview
 * @description API call to delete a review.
 * This action can typically be performed by the review author, an admin, or a property owner.
 * @param {number} reviewId - The ID of the review to delete.
 * @returns {Promise<void>} A promise that resolves if the deletion is successful (indicated by a 204 No Content status).
 * @throws {Error} Throws an error if the network response is not OK and not a 204 No Content status.
 */
export async function deleteReview(reviewId: number): Promise<void> {
  console.log(`API Fetcher: Attempting to delete review ID: ${reviewId}`);
  // Using fetchAuthenticated for this DELETE request.
  // fetchAuthenticated is designed to return null for 204 No Content, which matches Promise<void>.
  return fetchAuthenticated<void>(`/reviews/${reviewId}`, 'DELETE');
}