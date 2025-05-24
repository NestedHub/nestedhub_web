"use client"

import { useState, useEffect } from "react"
import type { Property } from "@/lib/mockData/properties"

// Define a type for the wishlist context
export interface WishlistContextType {
  wishlist: Property[]
  addToWishlist: (property: Property) => void
  removeFromWishlist: (propertyId: string) => void
  isInWishlist: (propertyId: string) => boolean
  clearWishlist: () => void
}

export function useWishlist(): WishlistContextType {
  const [wishlist, setWishlist] = useState<Property[]>([])

  // Load wishlist from localStorage on component mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist")
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist))
      } catch (error) {
        console.error("Failed to parse wishlist from localStorage:", error)
        localStorage.removeItem("wishlist")
      }
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist))
  }, [wishlist])

  const addToWishlist = (property: Property) => {
    setWishlist((prev) => {
      // Check if property already exists in wishlist
      if (prev.some((item) => item.id === property.id)) {
        return prev
      }
      return [...prev, property]
    })
  }

  const removeFromWishlist = (propertyId: string) => {
    setWishlist((prev) => prev.filter((property) => property.id !== propertyId))
  }

  const isInWishlist = (propertyId: string) => {
    return wishlist.some((property) => property.id === propertyId)
  }

  const clearWishlist = () => {
    setWishlist([])
  }

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
  }
}
