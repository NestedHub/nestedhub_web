"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, Home, Settings, LogOut } from "lucide-react"

interface SidebarProps {
  children: React.ReactNode
}

export default function Sidebar({ children }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ email: string } | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      // Redirect to login if not logged in
      router.push("/login")
    }
  }, [router])

  // If user is not loaded yet, show loading
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-green-800 text-white">
        <div className="p-4 flex items-center justify-center">
        <Image src="/logowhite.png" alt="NestedHub Logo" width={120} height={40} />
        </div>

        <nav className="mt-8 px-4">
          <Link
            href="/propertyowner/dashboard"
            className={`flex items-center py-3 px-4 rounded-md mb-2 ${
              pathname === "/propertyowner/dashboard" ? "bg-green-700" : "hover:bg-green-700"
            }`}
          >
            <LayoutDashboard size={20} className="mr-3" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/propertyowner/property"
            className={`flex items-center py-3 px-4 rounded-md mb-2 ${
              pathname === "/propertyowner/property" ? "bg-green-700" : "hover:bg-green-700"
            }`}
          >
            <Home size={20} className="mr-3" />
            <span>Property Listing</span>
          </Link>

          <Link
            href="/propertyowner/setting"
            className={`flex items-center py-3 px-4 rounded-md mb-2 ${
              pathname === "/propertyowner/setting" ? "bg-green-700" : "hover:bg-green-700"
            }`}
          >
            <Settings size={20} className="mr-3" />
            <span>Setting</span>
          </Link>

          <Link
            href="/propertyowner/logout"
            className={`flex items-center py-3 px-4 rounded-md mb-2 ${
              pathname === "/propertyowner/logout" ? "bg-green-700" : "hover:bg-green-700"
            }`}
          >
            <LogOut size={20} className="mr-3" />
            <span>Log out</span>
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b py-4 px-6">
          <div className="flex justify-end">
            <div className="flex items-center">
              <div className="mr-3 text-right">
                <div className="text-sm font-medium">Song Lyne</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <Image src="/avatar-placeholder.png" alt="User Avatar" width={40} height={40} />
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-white">{children}</main>
      </div>
    </div>
  )
}
