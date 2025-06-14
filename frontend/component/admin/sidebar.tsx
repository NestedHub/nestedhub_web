// component/admin/sidebar.tsx
"use client"

import { useState, useEffect, memo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronUp, LayoutDashboard, Users, Home, LogOut } from "lucide-react"
import { useAuthContext } from "@/lib/context/AuthContext" // <-- CORRECTED IMPORT PATH

interface SidebarProps {
  children: React.ReactNode
}

const AdminSidebar = memo(function AdminSidebar({ children }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuthContext() // <-- CORRECTED HOOK CALL, also added logout for later
  const [userManagementOpen, setUserManagementOpen] = useState(false)
  const [propertyListingOpen, setPropertyListingOpen] = useState(false)

  // Check if the current path is under a specific section
  const isUserManagementActive = pathname?.startsWith("/admin/usermanagement")
  const isPropertyListingActive = pathname?.startsWith("/admin/propertylisting")

  // Set dropdown state based on active path
  useEffect(() => {
    if (isUserManagementActive) setUserManagementOpen(true)
    if (isPropertyListingActive) setPropertyListingOpen(true)
  }, [isUserManagementActive, isPropertyListingActive])

  // Handle logout action
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior
    try {
      await logout(); // Call the logout function from useAuthContext
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally show a user-friendly error message
    }
    // The useAuthContext hook already handles redirection to /login
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b">
          <Link href="/admin/dashboard" className="text-xl font-bold text-green-800">
            NestedHub Admin
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin/dashboard"
                className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${
                  pathname === "/admin/dashboard" ? "bg-gray-100 text-green-800" : "text-gray-700"
                }`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
            </li>

            {/* User Management Dropdown */}
            <li>
              <button
                onClick={() => setUserManagementOpen(!userManagementOpen)}
                className={`flex items-center justify-between w-full p-2 rounded-md hover:bg-gray-100 ${
                  isUserManagementActive ? "bg-gray-100 text-green-800" : "text-gray-700"
                }`}
              >
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3" />
                  User Management
                </div>
                {userManagementOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {userManagementOpen && (
                <ul className="pl-10 mt-2 space-y-2">
                  <li>
                    <Link
                      href="/admin/usermanagement/user"
                      className={`block p-2 rounded-md hover:bg-gray-100 ${
                        pathname === "/admin/usermanagement/user" ? "text-green-800" : "text-gray-600"
                      }`}
                    >
                      Customers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/usermanagement/propertyowner"
                      className={`block p-2 rounded-md hover:bg-gray-100 ${
                        pathname === "/admin/usermanagement/propertyowner" ? "text-green-800" : "text-gray-600"
                      }`}
                    >
                      Property Owners
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/usermanagement/property-owner-request"
                      className={`block p-2 rounded-md hover:bg-gray-100 ${
                        pathname === "/admin/usermanagement/property-owner-request" ? "text-green-800" : "text-gray-600"
                      }`}
                    >
                      Property Owner Requests
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Property Listing Dropdown */}
            <li>
              <button
                onClick={() => setPropertyListingOpen(!propertyListingOpen)}
                className={`flex items-center justify-between w-full p-2 rounded-md hover:bg-gray-100 ${
                  isPropertyListingActive ? "bg-gray-100 text-green-800" : "text-gray-700"
                }`}
              >
                <div className="flex items-center">
                  <Home className="w-5 h-5 mr-3" />
                  Property Listing
                </div>
                {propertyListingOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {propertyListingOpen && (
                <ul className="pl-10 mt-2 space-y-2">
                  <li>
                    <Link
                      href="/admin/propertylisting/rents"
                      className={`block p-2 rounded-md hover:bg-gray-100 ${
                        pathname === "/admin/propertylisting/rents" ? "text-green-800" : "text-gray-600"
                      }`}
                    >
                      Rentals
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/propertylisting/propertyrequest"
                      className={`block p-2 rounded-md hover:bg-gray-100 ${
                        pathname === "/admin/propertylisting/propertyrequest" ? "text-green-800" : "text-gray-600"
                      }`}
                    >
                      Property Requests
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Logout */}
            <li>
              <a
                href="/admin/login" // Keep href for accessibility/fallback
                onClick={handleLogout} // Call the new handler
                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-4">
            <div className="text-sm text-gray-600">
              Welcome back, {user?.name || "Admin"}
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
})

AdminSidebar.displayName = "AdminSidebar"

export default AdminSidebar
