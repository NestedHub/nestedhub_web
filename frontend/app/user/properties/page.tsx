"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react"
import Header from "@/component/user/header"
import PropertyCard from "@/component/property/propertyCard"
import { getAllProperties, getPropertiesByType } from "@/lib/mockData/properties"
import type { Property } from "@/lib/mockData/properties"

// Define a type that includes the required image field
interface PropertyWithImage extends Omit<Property, "images"> {
  image: string
  images?: Property["images"]
}

export default function PropertiesPage() {
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get("filter") || ""

  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [propertyTypeFilter, setPropertyTypeFilter] = useState(
    initialFilter === "apartment"
      ? "Apartment"
      : initialFilter === "condo"
        ? "Condo"
        : initialFilter === "dorm"
          ? "Dorm"
          : "",
  )
  const [priceSort, setPriceSort] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Function to map a Property to PropertyWithImage
  const mapPropertyToPropertyWithImage = (property: Property): PropertyWithImage => {
    let imageUrl = "/property.png" // Default fallback image

    if (property.images && property.images.length > 0) {
      // Try to find primary image first
      const primaryImage = property.images.find((img) => img.isPrimary)
      if (primaryImage && primaryImage.url) {
        imageUrl = primaryImage.url
      } else if (property.images[0].url) {
        // Otherwise use the first image
        imageUrl = property.images[0].url
      }
    }

    return {
      ...property,
      image: imageUrl,
    }
  }

  // Get unique locations for filter
  const locations = [...new Set(properties.map((property) => property.location))]

  // Property types for filter
  const propertyTypes = ["Apartment", "Condo", "Dorm", "House", "Villa"]

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true)
      try {
        let propertiesData: Property[] = []

        if (initialFilter === "new") {
          // Get new listings
          propertiesData = await getAllProperties({ sortBy: "date", limit: 20 })
        } else if (["apartment", "condo", "dorm"].includes(initialFilter)) {
          // Get properties by type
          const type = initialFilter.charAt(0).toUpperCase() + initialFilter.slice(1)
          propertiesData = await getPropertiesByType(type)
        } else {
          // Get all properties
          propertiesData = await getAllProperties()
        }

        setProperties(propertiesData)
        setFilteredProperties(propertiesData)
      } catch (error) {
        console.error("Error fetching properties:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperties()
  }, [initialFilter])

  // Apply filters and search
  useEffect(() => {
    let result = [...properties]

    // Apply search query
    if (searchQuery) {
      result = result.filter(
        (property) =>
          property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply location filter
    if (locationFilter) {
      result = result.filter((property) => property.location.toLowerCase().includes(locationFilter.toLowerCase()))
    }

    // Apply property type filter
    if (propertyTypeFilter) {
      result = result.filter((property) => property.type === propertyTypeFilter)
    }

    // Apply price sorting
    if (priceSort) {
      result.sort((a, b) => {
        const priceA = Number.parseFloat(a.price.replace(/[^0-9.]/g, ""))
        const priceB = Number.parseFloat(b.price.replace(/[^0-9.]/g, ""))

        return priceSort === "low-to-high" ? priceA - priceB : priceB - priceA
      })
    }

    setFilteredProperties(result)
  }, [properties, searchQuery, locationFilter, propertyTypeFilter, priceSort])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Properties</h1>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search Bar */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filter By</span>
          </div>

          {/* Location Filter */}
          <div className="relative">
            <button
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
              onClick={() => document.getElementById("locationDropdown")?.classList.toggle("hidden")}
            >
              <span className="text-sm">{locationFilter || "Location"}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <div
              id="locationDropdown"
              className="absolute z-10 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg hidden"
            >
              <div className="py-1">
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setLocationFilter("")}
                >
                  All Locations
                </button>
                {locations.map((location) => (
                  <button
                    key={location}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setLocationFilter(location)}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Property Type Filter */}
          <div className="relative">
            <button
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
              onClick={() => document.getElementById("propertyTypeDropdown")?.classList.toggle("hidden")}
            >
              <span className="text-sm">{propertyTypeFilter || "Property type"}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <div
              id="propertyTypeDropdown"
              className="absolute z-10 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg hidden"
            >
              <div className="py-1">
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setPropertyTypeFilter("")}
                >
                  All Types
                </button>
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setPropertyTypeFilter(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Price Sort */}
        <div className="relative ml-auto">
          <button
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
            onClick={() => document.getElementById("priceSortDropdown")?.classList.toggle("hidden")}
          >
            <span className="text-sm">
              {priceSort === "low-to-high"
                ? "Price: Low to High"
                : priceSort === "high-to-low"
                  ? "Price: High to Low"
                  : "Price Sort"}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>
          <div
            id="priceSortDropdown"
            className="absolute right-0 z-10 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg hidden"
          >
            <div className="py-1">
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => setPriceSort("")}
              >
                Default
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => setPriceSort("low-to-high")}
              >
                Price: Low to High
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => setPriceSort("high-to-low")}
              >
                Price: High to Low
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={mapPropertyToPropertyWithImage(property)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
