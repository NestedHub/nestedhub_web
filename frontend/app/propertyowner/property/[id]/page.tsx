"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/component/dashoboadpropertyowner/sidebar";
import { propertyApi } from '@/lib/api/property';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await propertyApi.getProperty(propertyId);
        setProperty(data);
      } catch (err) {
        setError("Failed to load property detail");
      } finally {
        setIsLoading(false);
      }
    };
    if (propertyId) fetchProperty();
  }, [propertyId]);

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return <Sidebar><div className="p-6">Loading property detail...</div></Sidebar>;
  }
  if (error || !property) {
    return <Sidebar><div className="p-6 text-red-600">{error || "Property not found"}</div></Sidebar>;
  }

  return (
    <Sidebar>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Property Listing</h1>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold">Property Detail</h2>
        </div>

        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <div className="grid grid-cols-2">
            <div className="font-medium">Title</div>
            <div>{property.title}</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="font-medium mb-2">Image</div>
          <div className="flex flex-wrap gap-2">
            {property.media && property.media.length > 0 ? (
              property.media.map((img: any) => (
                <img key={img.media_url} src={img.media_url} alt="Property" className="w-32 h-24 object-cover rounded" />
              ))
            ) : (
          <div className="bg-gray-200 w-64 h-48 rounded-md flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="font-medium mb-2">Title</div>
            <div>{property.title}</div>
          </div>
          <div>
            <div className="font-medium mb-2">Description</div>
            <div>{property.description}</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="font-medium mb-2">Home Detail</div>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-medium">Category</div>
                <div>{property.category_name}</div>
              </div>
              <div>
                <div className="font-medium">Bedroom</div>
                <div>{property.bedrooms}</div>
              </div>
              <div>
                <div className="font-medium">Bathroom</div>
                <div>{property.bathrooms}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="font-medium mb-2">Rent Information</div>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-medium">Rent Price</div>
                <div>{property.pricing?.rent_price}</div>
              </div>
              <div>
                <div className="font-medium">Location</div>
                <div>{property.location?.street_number}</div>
              </div>
              <div>
                <div className="font-medium">Latitude</div>
                <div>{property.location?.latitude}</div>
              </div>
              <div>
                <div className="font-medium">Longitude</div>
                <div>{property.location?.longitude}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleBack}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mr-2"
          >
            Back
          </button>
          <button
            onClick={() =>
              router.push(`/propertyowner/property/edit/${propertyId}`)
            }
            className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Edit
          </button>
        </div>
      </div>
    </Sidebar>
  );
}
