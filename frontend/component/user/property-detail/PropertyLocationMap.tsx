"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Property } from "@/lib/properties-type"; // Import the main Property type

// We define the PropertyLocation type locally by picking it from the Property interface.
// This ensures it exactly matches the structure of property.location.
type PropertyLocation = Property['location'];

interface PropertyLocationMapProps {
  location: PropertyLocation; // Use the newly defined local type
}

const containerStyle = {
  width: "100%",
  height: "100%", // This must match container div's actual height
};

export function PropertyLocationMap({ location }: PropertyLocationMapProps) {
  // Convert latitude and longitude strings to numbers for the map center
  const center = {
    lat: parseFloat(location.latitude),
    lng: parseFloat(location.longitude),
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Location & Nearby Places</h2>

      <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200">
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={16}
          >
            <Marker position={center} />
          </GoogleMap>
        </LoadScript>
      </div>

      <p className="text-sm text-gray-600 mt-2">
        Coordinates: Lat {location.latitude}, Long {location.longitude}
      </p>
      {/* Optionally, display the full address here for user reference */}
      <p className="text-base text-gray-700 mt-1">
        Address: {location.street_number}, {location.commune_name}, {location.district_name}, {location.city_name}
      </p>
    </div>
  );
}