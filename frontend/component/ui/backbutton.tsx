"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"

interface BackButtonProps {
  label?: string
  className?: string
}

export default function BackButton({ label = "Back", className = "" }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <button
      onClick={handleBack}
      className={`flex items-center text-gray-600 hover:text-gray-900 transition-colors ${className}`}
    >
      <ChevronLeft className="h-5 w-5 mr-1" />
      <span>{label}</span>
    </button>
  )
}
