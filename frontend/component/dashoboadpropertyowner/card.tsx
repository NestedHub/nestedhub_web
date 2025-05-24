import type React from "react"
interface CardProps {
  title: string
  value: string
  icon: React.ReactNode
}

export default function Card({ title, value, icon }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center">
      <div className="mr-4 bg-green-50 p-3 rounded-md">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}
