"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Edit, Trash2 } from "lucide-react";
import AdminSidebar from "@/component/admin/sidebar";
import Pagination from "@/component/admin/pagination";
import { propertyApi, type Property } from "@/lib/api/property";
import { toast } from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

export default function RentalPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const response = await propertyApi.searchProperties({
        status: 'rented',
        keyword: debouncedSearchTerm || undefined,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      });
      setProperties(response?.items || []);
      setTotalCount(response?.total || 0);
      setTotalPages(Math.ceil((response?.total || 0) / ITEMS_PER_PAGE));
    } catch (err) {
      console.error("Error fetching properties:", err);
      setProperties([]);
      setTotalCount(0);
      setTotalPages(1);
      toast.error("Failed to load properties");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [currentPage, debouncedSearchTerm]);

  const handleEdit = (id: number) => {
    router.push(`/admin/propertylisting/rents/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      await propertyApi.deleteProperty(id);
      toast.success("Property deleted successfully");
      fetchProperties();
    } catch (err) {
      console.error("Error deleting property:", err);
      toast.error("Failed to delete property");
    }
  };

  const handleView = (id: number) => {
    router.push(`/admin/propertylisting/rents/${id}`);
  };

  return (
    <AdminSidebar>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Rental Properties</h1>
          <div className="text-sm text-gray-500">
            Total Properties: {totalCount}
          </div>
        </div>

        <div className="mb-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pl-10"
            />
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-md shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date List
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    No properties found
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <tr key={property.property_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.property_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {property.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(property.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(property.property_id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(property.property_id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => handleView(property.property_id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </AdminSidebar>
  );
}
