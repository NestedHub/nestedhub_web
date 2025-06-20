"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminSidebar from "@/component/admin/sidebar";
import BackButton from "@/component/ui/backbutton";
import { propertyApi, type Property } from "@/lib/api/property";
import { toast } from "react-hot-toast";

export default function RentalPropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = Number(params.id);
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true);
        const data = await propertyApi.getProperty(propertyId);
        setProperty(data);
      } catch (err) {
        setError("Failed to load property details");
        toast.error("Failed to load property details");
      } finally {
        setIsLoading(false);
      }
    };
    if (propertyId) fetchProperty();
  }, [propertyId]);

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AdminSidebar>
    );
  }

  if (error || !property) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">{error || "Property not found"}</div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div>
        <div className="flex items-center mb-6">
          <BackButton className="mr-4" />
          <h1 className="text-2xl font-bold">Rental property detail</h1>
        </div>
        <div className="bg-white rounded-md shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Property Detail</h2>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="font-medium mb-2">Title</div>
              <div>{property.title}</div>
            </div>
            <div>
              <div className="font-medium mb-2">Description</div>
              <div>{property.description}</div>
            </div>
            <div>
              <div className="font-medium mb-2">Category</div>
              <div>{property.category}</div>
            </div>
            <div>
              <div className="font-medium mb-2">Bedrooms</div>
              <div>{property.bedrooms}</div>
            </div>
            <div>
              <div className="font-medium mb-2">Bathrooms</div>
              <div>{property.bathrooms}</div>
            </div>
            <div>
              <div className="font-medium mb-2">Address</div>
              <div>{property.address}</div>
            </div>
            <div>
              <div className="font-medium mb-2">City</div>
              <div>{property.city}</div>
            </div>
            <div>
              <div className="font-medium mb-2">Status</div>
              <div>{property.status}</div>
            </div>
            <div>
              <div className="font-medium mb-2">Created At</div>
              <div>{new Date(property.created_at).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="font-medium mb-2">Owner ID</div>
              <div>{property.owner_id}</div>
            </div>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
