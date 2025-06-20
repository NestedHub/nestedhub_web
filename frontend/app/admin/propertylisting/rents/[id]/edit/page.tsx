"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminSidebar from "@/component/admin/sidebar";
import BackButton from "@/component/ui/backbutton";
import { propertyApi, type Property, type PropertyUpdateParams } from "@/lib/api/property";
import { toast } from "react-hot-toast";

export default function EditRentalPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = Number(params.id);

  const [property, setProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<PropertyUpdateParams>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;
      try {
        setIsLoading(true);
        const data = await propertyApi.getProperty(propertyId);
        setProperty(data);
        setFormData({
          title: data.title,
          description: data.description,
          rent_price: data.rent_price,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          floor_area: data.floor_area,
          status: data.status,
        });
      } catch (err) {
        setError("Failed to load property details");
        toast.error("Failed to load property details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number = value;
    if (type === 'number') {
      processedValue = value ? parseFloat(value) : 0;
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await propertyApi.updateProperty(propertyId, formData);
      toast.success("Property updated successfully!");
      router.push(`/admin/propertylisting/rents`);
    } catch (err) {
      toast.error("Failed to update property.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-full">Loading...</div>
      </AdminSidebar>
    );
  }

  if (error) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-full text-red-500">{error}</div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div>
        <div className="flex items-center mb-6">
          <BackButton />
          <h1 className="text-2xl font-bold ml-4">Edit Rental Property</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-md shadow p-6 space-y-6">
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" name="title" id="title" value={formData.title || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="rent_price" className="block text-sm font-medium text-gray-700">Rent Price</label>
              <input type="number" name="rent_price" id="rent_price" value={formData.rent_price || 0} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select name="status" id="status" value={formData.status || 'available'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="pending">Pending</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">Bedrooms</label>
              <input type="number" name="bedrooms" id="bedrooms" value={formData.bedrooms || 0} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">Bathrooms</label>
              <input type="number" name="bathrooms" id="bathrooms" value={formData.bathrooms || 0} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={isSaving} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </AdminSidebar>
  );
} 