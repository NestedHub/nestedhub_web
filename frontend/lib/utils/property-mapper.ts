// lib/utils/property-mapper.ts (Revised with rating handling)

import { ApiProperty } from '@/lib/types';
import { PropertyCardDisplayData } from '@/component/property/propertyCard';

export function mapApiPropertyToPropertyCardDisplay(
  apiProperty: ApiProperty
): PropertyCardDisplayData {
  const rentPrice = apiProperty.pricing.rent_price ?? 0; // Ensure rentPrice is a number

  return {
    id: String(apiProperty.property_id),
    title: apiProperty.title,
    category: apiProperty.category_name,
    price: rentPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    location: `${apiProperty.location.commune_name}, ${apiProperty.location.district_name}, ${apiProperty.location.city_name}`,
    bedrooms: apiProperty.bedrooms,
    bathrooms: apiProperty.bathrooms,
    image: apiProperty.media[0]?.media_url || "/property.png",
    // Map rating from API, converting null to undefined if PropertyCard expects undefined for absence
    rating: apiProperty.rating !== null ? apiProperty.rating : undefined,
  };
}