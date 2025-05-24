"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useWishlist } from "@/lib/hooks/usewishlist"

// Create context
export const WishlistContext = createContext<ReturnType<typeof useWishlist> | undefined>(undefined)

// Provider component
export function WishlistProvider({ children }: { children: ReactNode }) {
  const wishlistHook = useWishlist()

  return <WishlistContext.Provider value={wishlistHook}>{children}</WishlistContext.Provider>
}

// Hook to use the wishlist context
export function useWishlistContext() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlistContext must be used within a WishlistProvider")
  }
  return context
}
