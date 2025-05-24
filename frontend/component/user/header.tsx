"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronDown, Heart, Menu, User } from "lucide-react"
import { useState } from "react"
import { useWishlist } from "@/lib/hooks/usewishlist"

interface HeaderProps {
  userType?: string
}

export default function Header({ userType = "user" }: HeaderProps) {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const { wishlist } = useWishlist()

  return (
    <header className="bg-green-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/user" className="flex items-center">
            <Image src="/logowhite.png" alt="NestedHub Logo" width={80} height={40} />
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/user" className="text-white hover:text-gray-200">
              Home
            </Link>
            <Link href="/user/rent" className="text-white hover:text-gray-200">
              Rent
            </Link>
            <Link href="/user/about" className="text-white hover:text-gray-200">
              About us
            </Link>
            <Link href="/user/faq" className="text-white hover:text-gray-200">
              FAQ
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                className="flex items-center space-x-1 text-sm"
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              >
                <Image src="/english.png" alt="English" width={20} height={15} className="h-4 w-6 object-cover" />
                <span className="hidden sm:inline">English</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                      <Image
                        src="/english.png"
                        alt="English"
                        width={20}
                        height={15}
                        className="h-4 w-6 object-cover mr-2"
                      />
                      English
                    </button>
                    <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                      <Image
                        src="/khmer.png"
                        alt="Khmer"
                        width={20}
                        height={15}
                        className="h-4 w-6 object-cover mr-2"
                      />
                      ខ្មែរ
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link href="/user/wishlist" className="text-white hover:text-gray-200 relative">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* User Profile */}
            <Link href="/login" className="flex items-center space-x-1">
              <div className="bg-white rounded-full p-1">
                <User className="h-5 w-5 text-green-800" />
              </div>
              <span className="hidden sm:inline text-sm font-medium">Sign In</span>
            </Link>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-white">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
