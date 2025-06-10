"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react"
import Header from "@/component/user/header"
import Footer from "@/component/user/footer"
import PropertySection from "@/component/property/propertySection"
import { fetchNewListings, fetchPropertiesByType } from "@/lib/api/properties"
import type { Property } from "@/lib/api/properties"

export default function UserHomePage() {
  const [newListings, setNewListings] = useState<Property[]>([])
  const [apartments, setApartments] = useState<Property[]>([])
  const [condos, setCondos] = useState<Property[]>([])
  const [dorms, setDorms] = useState<Property[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch all data in parallel for better performance
        const [newListingsData, apartmentsData, condosData, dormsData] = await Promise.all([
          fetchNewListings(6),
          fetchPropertiesByType("Apartment", 6),
          fetchPropertiesByType("Condo", 6),
          fetchPropertiesByType("Dorm", 6),
        ])

        setNewListings(newListingsData.items)
        setApartments(apartmentsData.items)
        setCondos(condosData.items)
        setDorms(dormsData.items)
      } catch (error) {
        console.error("Error fetching properties:", error)
        setError("Failed to load properties")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header userType="user" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-red-600">{error}</div>
        </div>
        <Footer userType="user" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header userType="user" />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md bg-white">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-sm">Filter By</span>
              </button>

              <div className="relative">
                <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md bg-white">
                  <span className="text-sm">Location</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <div className="relative">
                <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md bg-white">
                  <span className="text-sm">Property type</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative">
            <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md bg-white">
              <span className="text-sm">Price Sort</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <h1 className="text-4xl font-bold text-green-800 leading-tight">
              Let us help you
              <br />
              find the perfect
              <br />
              property today.
            </h1>
          </div>
          <div className="md:w-1/2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Q9cJFIDOa8MQNzZkw3gti1nVkvmcon.png"
              alt="Modern Property"
              width={600}
              height={400}
              className="rounded-md"
              priority // Add priority to load hero image first
            />
          </div>
        </div>
      </div>

      {/* Property Listings Sections */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="container mx-auto px-4">
          <PropertySection
            title="New Listings"
            properties={newListings}
            viewAllLink="/user/properties?filter=new"
            maxItems={3}
          />
          <PropertySection
            title="Apartments"
            properties={apartments}
            viewAllLink="/user/properties?filter=apartment"
            maxItems={3}
          />
          <PropertySection
            title="Condos"
            properties={condos}
            viewAllLink="/user/properties?filter=condo"
            maxItems={3}
          />
          <PropertySection title="Dorms" properties={dorms} viewAllLink="/user/properties?filter=dorm" maxItems={3} />
        </div>
      )}

      <Footer userType="user" />
    </div>
  )
}
