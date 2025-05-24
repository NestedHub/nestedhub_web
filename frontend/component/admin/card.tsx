import type { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string
  icon: ReactNode
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center">
      <div className="mr-4 bg-teal-50 p-3 rounded-full">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}
