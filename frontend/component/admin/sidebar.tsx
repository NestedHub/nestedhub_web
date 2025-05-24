"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { LayoutDashboard, Users, Home, Settings, LogOut, ChevronDown, ChevronRight } from "lucide-react"

interface SidebarProps {
  children: React.ReactNode
}

export default function AdminSidebar({ children }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userManagementOpen, setUserManagementOpen] = useState(false)
  const [propertyListingOpen, setPropertyListingOpen] = useState(false)
  const [admin, setAdmin] = useState<{ email: string; role: string } | null>(null)

  // Check if the current path is under a specific section
  const isUserManagementActive = pathname?.includes("/admin/usermanagement")
  const isPropertyListingActive = pathname?.includes("/admin/propertylisting")

  useEffect(() => {
    // Check if admin is logged in
    const storedAdmin = localStorage.getItem("admin")

    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin))

      // Redirect to dashboard if on the root admin path
      if (pathname === "/admin") {
        router.push("/admin/dashboard")
      }
    } else {
      // Redirect to admin login if not logged in
      router.push("/admin-login")
    }
  }, [router, pathname])

  // Set dropdown state based on active path
  useEffect(() => {
    if (isUserManagementActive) setUserManagementOpen(true)
    if (isPropertyListingActive) setPropertyListingOpen(true)
  }, [isUserManagementActive, isPropertyListingActive])

  // If admin is not loaded yet, show loading
  if (!admin) {
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
          <Image src="/logowhite.png" alt="NestedHub Logo" width={200} height={40} />
        </div>

        <nav className="mt-6 px-4">
          <Link
            href="/admin/dashboard"
            className={`flex items-center py-3 px-4 rounded-md mb-2 ${
              pathname === "/admin/dashboard" ? "bg-green-700" : "hover:bg-green-700"
            }`}
          >
            <LayoutDashboard size={20} className="mr-3" />
            <span>Dashboard</span>
          </Link>

          {/* User Management Dropdown */}
          <div className="mb-2">
            <button
              onClick={() => setUserManagementOpen(!userManagementOpen)}
              className={`flex items-center justify-between w-full py-3 px-4 rounded-md ${
                isUserManagementActive ? "bg-green-700" : "hover:bg-green-700"
              }`}
            >
              <div className="flex items-center">
                <Users size={20} className="mr-3" />
                <span>User Management</span>
              </div>
              {userManagementOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {userManagementOpen && (
              <div className="ml-6 mt-1 space-y-1">
                <Link
                  href="/admin/usermanagement/property-owner-request"
                  className={`flex items-center py-2 px-4 rounded-md ${
                    pathname === "/admin/usermanagement/property-owner-request" ? "bg-green-700" : "hover:bg-green-700"
                  }`}
                >
                  <span>Property owner Request</span>
                </Link>
                <Link
                  href="/admin/usermanagement/propertyowner"
                  className={`flex items-center py-2 px-4 rounded-md ${
                    pathname === "/admin/usermanagement/propertyowner" ? "bg-green-700" : "hover:bg-green-700"
                  }`}
                >
                  <span>Property owner</span>
                </Link>
                <Link
                  href="/admin/usermanagement/user"
                  className={`flex items-center py-2 px-4 rounded-md ${
                    pathname === "/admin/usermanagement/user" ? "bg-green-700" : "hover:bg-green-700"
                  }`}
                >
                  <span>User</span>
                </Link>
              </div>
            )}
          </div>

          {/* Property Listing Dropdown */}
          <div className="mb-2">
            <button
              onClick={() => setPropertyListingOpen(!propertyListingOpen)}
              className={`flex items-center justify-between w-full py-3 px-4 rounded-md ${
                isPropertyListingActive ? "bg-green-700" : "hover:bg-green-700"
              }`}
            >
              <div className="flex items-center">
                <Home size={20} className="mr-3" />
                <span>Property Listing</span>
              </div>
              {propertyListingOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {propertyListingOpen && (
              <div className="ml-6 mt-1 space-y-1">
                <Link
                  href="/admin/propertylisting/propertyrequest"
                  className={`flex items-center py-2 px-4 rounded-md ${
                    pathname === "/admin/propertylisting/propertyrequest" ? "bg-green-700" : "hover:bg-green-700"
                  }`}
                >
                  <span>Property Request</span>
                </Link>
                <Link
                  href="/admin/propertylisting/rents"
                  className={`flex items-center py-2 px-4 rounded-md ${
                    pathname === "/admin/propertylisting/rents" ? "bg-green-700" : "hover:bg-green-700"
                  }`}
                >
                  <span>Rent</span>
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/admin/setting"
            className={`flex items-center py-3 px-4 rounded-md mb-2 ${
              pathname === "/admin/setting" ? "bg-green-700" : "hover:bg-green-700"
            }`}
          >
            <Settings size={20} className="mr-3" />
            <span>Setting</span>
          </Link>

          <Link
            href="/admin/logout"
            className={`flex items-center py-3 px-4 rounded-md mb-2 ${
              pathname === "/admin/logout" ? "bg-green-700" : "hover:bg-green-700"
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
                <div className="text-sm font-medium">Admin</div>
                <div className="text-xs text-gray-500">{admin.email}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-white p-6">{children}</main>
      </div>
    </div>
  )
}
