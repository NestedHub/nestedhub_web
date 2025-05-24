import Sidebar from "@/component/dashoboadpropertyowner/sidebar"
import Card from "@/component/dashoboadpropertyowner/card"
import { LayoutGrid, Home } from "lucide-react"

export default function DashboardPage() {
  return (
    <Sidebar>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back to your dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Total Rooms" value="100" icon={<LayoutGrid className="h-6 w-6 text-green-600" />} />
          <Card title="Active Rooms" value="50" icon={<Home className="h-6 w-6 text-green-600" />} />
        </div>
      </div>
    </Sidebar>
  )
}
