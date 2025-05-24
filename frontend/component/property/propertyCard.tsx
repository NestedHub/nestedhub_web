"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Heart, Star } from "lucide-react"
import { useState } from "react"

interface PropertyCardProps {
  property: {
    id: string
    title: string
    type: string
    price: string
    location: string
    bedrooms: number
    bathrooms: number
    image: string
  }
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
  }

  return (
    <Link href={`/user/property/${property.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg">
        <div className="relative">
          <Image
            src={property.image || "/property.png"}
            alt={property.title}
            width={400}
            height={250}
            className="w-full h-48 object-cover"
          />
          <button onClick={toggleWishlist} className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md">
            <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
          </button>
          <div className="absolute bottom-2 left-2 flex items-center bg-white px-2 py-1 rounded-md shadow-sm">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
            <span className="text-sm font-medium">4.8</span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{property.title}</h3>
          <p className="text-gray-500 text-sm mb-2">{property.location}</p>
          <div className="flex justify-between items-center mb-3">
            <span className="text-green-600 font-bold">{property.price}</span>
            <span className="text-gray-500 text-sm">{property.type}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex space-x-3 text-gray-500 text-sm">
              <span>{property.bedrooms} Beds</span>
              <span>{property.bathrooms} Baths</span>
            </div>
            <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
              Book
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
