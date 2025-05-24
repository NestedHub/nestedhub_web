"use client"

import { useState } from "react"
import { useWishlist } from "@/lib/hooks/usewishlist"
import PropertyCard from "@/component/property/propertyCard"
import { Search, SlidersHorizontal, ChevronDown, Heart } from "lucide-react"

export default function WishlistPage() {
  const { wishlist } = useWishlist()
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("")
  const [priceSort, setPriceSort] = useState("")

  // Filter and sort wishlist items
  const filteredWishlist = wishlist
    .filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesLocation = locationFilter
        ? property.location.toLowerCase().includes(locationFilter.toLowerCase())
        : true

      const matchesType = propertyTypeFilter ? property.type.toLowerCase() === propertyTypeFilter.toLowerCase() : true

      return matchesSearch && matchesLocation && matchesType
    })
    .sort((a, b) => {
      if (priceSort === "low-to-high") {
        return Number.parseFloat(a.price.replace(/[^0-9.]/g, "")) - Number.parseFloat(b.price.replace(/[^0-9.]/g, ""))
      } else if (priceSort === "high-to-low") {
        return Number.parseFloat(b.price.replace(/[^0-9.]/g, "")) - Number.parseFloat(a.price.replace(/[^0-9.]/g, ""))
      }
      return 0
    })

  // Get unique locations and property types for filters
  const locations = [...new Set(wishlist.map((property) => property.location))]
  const propertyTypes = [...new Set(wishlist.map((property) => property.type))]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>

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
              <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md bg-white">
                <span className="text-sm">Location</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg hidden">
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
              <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md bg-white">
                <span className="text-sm">Property type</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg hidden">
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
          <div className="relative">
            <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md bg-white">
              <span className="text-sm">Price Sort</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="absolute right-0 z-10 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg hidden">
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
      </div>

      {/* Wishlist Items */}
      {filteredWishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredWishlist.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 mb-4 text-gray-300">
            <Heart className="w-full h-full" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-6">Save properties you like by clicking the heart icon</p>
        </div>
      )}
    </div>
  )
}
