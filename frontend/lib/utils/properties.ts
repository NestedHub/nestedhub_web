// Assuming this is in a file like '@/lib/utils/properties.ts'
import { PropertyApiResponse } from "@/lib/utils/api" // Make sure this import path is correct

export interface PropertyWithImage {
  id: string
  title: string
  category: string
  price: string
  location: string
  bedrooms: number
  bathrooms: number
  image: string
  listed_at: string // Ensure listed_at is always present if required
}

export const mapApiPropertyToPropertyWithImage = (property: PropertyApiResponse["properties"][0]): PropertyWithImage | null => {
  // Adding a try-catch for robustness, as discussed.
  // This will ensure that if any individual property mapping fails, it doesn't break the whole list.
  try {
    const imageUrl = property.media.find((m) => m.media_type === "image")?.media_url || "/property.png";

    const location = [
      property.location.street_number,
      property.location.commune_name,
      property.location.district_name,
      property.location.city_name,
    ]
      .filter(Boolean) // Remove any null, undefined, or empty strings
      .join(", ");

    // *** THE CRITICAL FIX IS HERE ***
    // Convert the rent_price from a string or number to a number BEFORE formatting
    const numericRentPrice = parseFloat(property.pricing.rent_price.toString());

    // Check if the conversion resulted in a valid number
    const formattedPrice = isNaN(numericRentPrice)
      ? 'N/A' // Or a default value if the price is invalid
      : `$${numericRentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

    return {
      id: property.property_id.toString(), // Convert property_id to string if it's a number from API
      title: property.title,
      category: property.category_name.toString(),
      price: formattedPrice,
      location,
      bedrooms: Number(property.bedrooms),
      bathrooms: Number(property.bathrooms),
      image: imageUrl,
      listed_at: property.listed_at, // Ensure this matches your API response type
    };
  } catch (error) {
    console.error(`Error mapping API property with ID ${property.property_id}:`, error);
    return null; // Return null if there's an error during mapping
  }
};