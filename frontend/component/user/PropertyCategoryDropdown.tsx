import { Home, ChevronDown } from "lucide-react"

interface PropertyCategoryDropdownProps {
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
  handleFilterChange: (key: string, value: string) => void
  getSelectedPropertyCategoryText: () => string
  propertyCategories: { id: number | string; name: string }[] // NEW prop
}

export default function PropertyCategoryDropdown({
  filters,
  dropdownStates,
  toggleDropdown,
  handleFilterChange,
  getSelectedPropertyCategoryText,
  propertyCategories,
}: PropertyCategoryDropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={() => toggleDropdown("propertyCategory")}
        className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md min-w-[130px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {getSelectedPropertyCategoryText()}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            dropdownStates.propertyCategory ? "rotate-180" : ""
          }`}
        />
      </button>
      {dropdownStates.propertyCategory && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="p-2">
            <button
              onClick={() => {
                handleFilterChange("category_id", "")
                toggleDropdown("propertyCategory")
              }}
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                !filters.category_id ? "bg-green-50 text-green-700" : ""
              }`}
            >
              All Categories
            </button>
            {propertyCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  handleFilterChange("category_id", category.id.toString())
                  toggleDropdown("propertyCategory")
                }}
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                  filters.category_id === category.id.toString()
                    ? "bg-green-50 text-green-700"
                    : ""
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
