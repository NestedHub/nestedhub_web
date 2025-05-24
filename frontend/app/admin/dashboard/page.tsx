"use client"

import { Users, Home, User } from "lucide-react"
import AdminSidebar from "@/component/admin/sidebar"
import StatCard from "@/component/admin/card"

export default function AdminDashboardPage() {
  return (
    <AdminSidebar>
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-sm text-gray-500 mb-6">Welcome back, Admin</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Users" value="200" icon={<Users className="h-6 w-6 text-teal-600" />} />
          <StatCard title="Total Properties" value="100" icon={<Home className="h-6 w-6 text-teal-600" />} />
          <StatCard title="Total Property Owners" value="200" icon={<User className="h-6 w-6 text-teal-600" />} />
        </div>
      </div>
    </AdminSidebar>
  )
}
