// components/user/property-detail/PropertyLocationMap.tsx
import { PropertyLocation } from '@/lib/types'; // Assuming you have this type

interface PropertyLocationMapProps {
  location: PropertyLocation;
}

export function PropertyLocationMap({ location }: PropertyLocationMapProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Location & Nearby Places</h2>
      <div className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
        {/* Placeholder for an actual map component (e.g., Google Maps, Mapbox) */}
        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
          <span className="text-gray-500 text-lg font-medium">Map View of {location.city_name}</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-2">
          Coordinates: Lat {location.latitude}, Long {location.longitude}
      </p>
    </div>
  );
}