// api/reviewFetcher.ts

/**
 * @file This file contains the API client functions for interacting with the review endpoints.
 * It defines interfaces for review data structures and asynchronous functions to
 * perform CRUD operations (Create, Read, Update, Delete) on reviews.
 */

// Base URL for the API. In a real application, this would typically come from
// environment variables (e.g., process.env.REACT_APP_API_BASE_URL).
const BASE_URL = "http://localhost:8000/api/";

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

/**
 * @function getAuthHeader
 * @description Helper function to retrieve the authorization token from localStorage.
 * This token is crucial for authenticating API requests and is typically set after user login.
 * @returns {HeadersInit} An object containing the 'Authorization' header, or an empty object
 * if no authentication token is found in localStorage.
 */
const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
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
  const response = await fetch(`${BASE_URL}/reviews/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(), // Include authentication token from localStorage
    },
    body: JSON.stringify(reviewData), // Send review data as JSON string
  });

  if (!response.ok) {
    const errorData = await response.json(); // Parse error response for details
    throw new Error(errorData.detail || `Failed to create review: ${response.statusText}`);
  }

  return response.json(); // Return the parsed JSON response
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
  const response = await fetch(`${BASE_URL}/reviews/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(), // Include authentication token
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Failed to fetch user reviews: ${response.statusText}`);
  }

  return response.json();
}

/**
 * @function fetchReviewsForProperty
 * @description API call to retrieve reviews for a specific property.
 * By default, this endpoint usually returns only "approved" reviews to public users.
 * Admins and property owners, if authorized, might see all reviews (pending, approved, rejected).
 * @param {number} propertyId - The ID of the property for which to fetch reviews.
 * @returns {Promise<ReviewResponse[]>} A promise that resolves with a list of `ReviewResponse` objects
 * for the specified property.
 * @throws {Error} Throws an error if the network response is not OK or if the API returns an error message.
 */
export async function fetchReviewsForProperty(propertyId: number): Promise<ReviewResponse[]> {
  console.log(`API Fetcher: Attempting to fetch reviews for property ID: ${propertyId}`);
  const response = await fetch(`${BASE_URL}/reviews/public/property/${propertyId}/reviews`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(), // Authentication might be needed for specific roles (e.g., admin/owner) to see all reviews
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Failed to fetch reviews for property: ${response.statusText}`);
  }

  return response.json();
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
  const response = await fetch(`${BASE_URL}/reviews/${reviewId}/status`, {
    method: 'PATCH', // Use PATCH for partial updates
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(), // Include authentication token
    },
    body: JSON.stringify(statusData), // Send new status as JSON
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Failed to update review status: ${response.statusText}`);
  }

  return response.json();
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
  const response = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(), // Include authentication token
    },
  });

  // A 204 No Content status is a successful response for DELETE operations.
  // We only throw an error if the response is not OK AND not 204.
  if (!response.ok && response.status !== 204) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Failed to delete review: ${response.statusText}`);
  }
  // If response.ok or status is 204, it implies success, so the Promise resolves to void.
}

