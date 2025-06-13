import { ChevronDown } from "lucide-react"
import { sortOptions } from "@/lib/mockData/mockDropdownData"

interface SortDropdownProps {
  filters: {
    city_id: string
    district_id: string
    commune_id: string
    category_id: string
    sort_by: string
    sort_order: string
  }
  dropdownStates: {
    location: boolean
    propertyCategory: boolean
    priceSort: boolean
  }
  toggleDropdown: (dropdown: string) => void
  handleSortChange: (sortBy: string, sortOrder: string) => void
  getSelectedSortText: () => string
}

export default function SortDropdown({
  filters,
  dropdownStates,
  toggleDropdown,
  handleSortChange,
  getSelectedSortText,
}: SortDropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={() => toggleDropdown("priceSort")}
        className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md min-w-[140px] justify-between"
      >
        <span className="text-sm font-medium text-gray-700">{getSelectedSortText()}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            dropdownStates.priceSort ? "rotate-180" : ""
          }`}
        />
      </button>
      {dropdownStates.priceSort && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="p-2">
            {sortOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  handleSortChange(option.value, option.order)
                  toggleDropdown("priceSort")
                }}
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                  filters.sort_by === option.value && filters.sort_order === option.order
                    ? "bg-green-50 text-green-700"
                    : ""
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}