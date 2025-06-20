"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminSidebar from "@/component/admin/sidebar";
import BackButton from "@/component/ui/backbutton";
import { adminApi, type User } from "@/lib/api/admin";
import { getAuthHeaders } from "@/lib/api/auth";
import { toast } from "react-hot-toast";

export default function EditPropertyOwnerPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);

  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        setIsLoading(true);
        const data = await adminApi.getUser(userId);
        setUser(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      } catch (err) {
        setError("Failed to load property owner details");
        toast.error("Failed to load property owner details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      toast.success("Property owner updated successfully!");
      router.push(`/admin/usermanagement/propertyowner`);
    } catch (err) {
      toast.error("Failed to update property owner.");
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
          <h1 className="text-2xl font-bold ml-4">Edit Property Owner</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-md shadow p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
            <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
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