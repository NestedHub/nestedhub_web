"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-700">
        Show rows:
        <select className="ml-2 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value={10}>10 items</option>
          <option value={20}>20 items</option>
          <option value={50}>50 items</option>
        </select>
      </div>

      <div className="flex space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 py-1 rounded-md ${
            currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`px-3 py-1 rounded-md ${
              currentPage === number ? "bg-green-800 text-white" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            {number}
          </button>
        ))}

        {totalPages > 3 && (
          <>
            <span className="px-2 py-1">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages ? "bg-green-800 text-white" : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-2 py-1 rounded-md ${
            currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
