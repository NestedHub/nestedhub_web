"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Edit, Eye, Trash2, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react"
import { toast } from "react-hot-toast"
import { propertyApi } from '@/lib/api/property'

// A simple debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    return new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor)
    })
  }
}

// This type MUST match the PropertyOwnerListing model from the backend
interface PropertyListing {
  property_id: number;
  title: string;
  category: string;
  status: string;
  date_listed: string;
}

export default function PropertyTable() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  const [allProperties, setAllProperties] = useState<PropertyListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchProperties = useCallback(async (term: string) => {
    setIsLoading(true)
    setError("")
    try {
      const data = await propertyApi.getOwnerListings(term)
      setAllProperties(data.properties || [])
      setCurrentPage(1) // Reset to first page on new search
    } catch (err) {
      setError("Failed to load properties")
      toast.error("Failed to load your properties. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const debouncedFetch = useMemo(() => debounce(fetchProperties, 300), [fetchProperties])

  useEffect(() => {
    debouncedFetch(searchTerm)
  }, [searchTerm, debouncedFetch])


  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return allProperties.slice(startIndex, startIndex + itemsPerPage)
  }, [allProperties, currentPage, itemsPerPage])

  const totalPages = Math.ceil(allProperties.length / itemsPerPage)

  const handleViewDetails = (id: string | number) => {
    router.push(`/propertyowner/property/${id}`)
  }

  const handleEdit = (id: number) => {
    router.push(`/propertyowner/property/edit/${id}`)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      const toastId = toast.loading("Deleting property...")
      try {
        await propertyApi.deleteProperty(String(id))
        toast.success("Property deleted successfully.", { id: toastId })
        // Refetch properties after deletion
        fetchProperties(searchTerm)
      } catch (error) {
        toast.error("Failed to delete property.", { id: toastId })
      }
    }
  }

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        <button
          onClick={() => router.push("/propertyowner/property/create")}
          className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Create Property
        </button>
      </div>

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Listed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && allProperties.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="text-center py-8 text-red-600">{error}</td></tr>
            ) : paginatedProperties.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No properties found.</td></tr>
            ) : (
              paginatedProperties.map((property) => (
                <tr key={property.property_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{property.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${property.status === 'available' ? 'bg-green-100 text-green-800' :
                       property.status === 'rented' ? 'bg-red-100 text-red-800' :
                       'bg-yellow-100 text-yellow-800'}`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(property.date_listed).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleViewDetails(property.property_id)}
                        className="text-gray-600 hover:text-gray-900"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
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
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-700">
            Showing {paginatedProperties.length} of {allProperties.length} properties
          </span>
          <div className="flex items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="p-2 rounded-md bg-gray-200 text-gray-700 mr-2 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 py-1 text-sm">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="p-2 rounded-md bg-gray-200 text-gray-700 ml-2 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
