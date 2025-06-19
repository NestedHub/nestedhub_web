// utils/apiFetcher.js
// Make sure to adjust this import path to where your getAuthHeaders function is located
import { getAuthHeaders } from './auth'; // Assuming getAuthHeaders is in auth.ts/js

// Correct API_BASE_URL: This should be the base URL of your backend server,
// without the '/api' part, as that will be appended in the fetch call.
// So if your backend server is at 'http://localhost:8000', use that.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const compareProperties = async (propertyIds: string[] | number[]) => {
  const headers = {
    'Content-Type': 'application/json', // Essential for sending JSON in a POST request body
    ...getAuthHeaders(), // Spread the auth headers if your getAuthHeaders returns an object
  };

  try {
    // *** THE CORRECTED URL CONSTRUCTION ***
    // We combine the base URL with the exact API endpoint path.
    const url = `${API_BASE_URL}/api/properties/compare`; // <-- This is the key change!

    console.log("compareProperties - Attempting to fetch from URL:", url);
    console.log("compareProperties - Sending body:", JSON.stringify({ property_ids: propertyIds })); // Keep this to verify the payload

    const response = await fetch(url, {
      method: 'POST', // Confirmed: Backend expects POST
      headers: headers,
      body: JSON.stringify({ property_ids: propertyIds }), // Confirmed: IDs sent in the body
    });

    if (!response.ok) {
      const errorText = await response.text(); // Get raw text to help debug server errors
      console.error(`compareProperties - API error: Status ${response.status}, Response: ${errorText}`);
      let errorMessage = 'Unknown error';
      try {
          const errorData = JSON.parse(errorText); // Try to parse as JSON for more detail
          errorMessage = errorData.detail || errorData.message || `HTTP error! status: ${response.status}`;
      } catch (e) {
          // If response text is not valid JSON, use the status text
          errorMessage = response.statusText || `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("compareProperties - Successfully fetched data:", data); // Log successful data
    return data;
  } catch (error) {
    console.error("Error comparing properties:", error);
    throw error;
  }
};