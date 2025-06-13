import { MapPin, ChevronDown } from "lucide-react";

interface LocationDropdownProps {
  filters: {
    city_id: string;
    district_id: string;
    commune_id: string;
    category_id: string;
    sort_by: string;
    sort_order: string;
  };
  dropdownStates: {
    location: boolean;
    propertyCategory: boolean;
    priceSort: boolean;
  };
  toggleDropdown: (dropdown: string) => void;
  handleFilterChange: (key: string, value: string) => void;
  getSelectedLocationText: () => string;
  cities: { id: number | string; name: string }[];
  districts: { id: number | string; name: string }[]; // <-- Add this
  communes: { id: number | string; name: string }[]; // <-- Add this
}

export default function LocationDropdown({
  filters,
  dropdownStates,
  toggleDropdown,
  handleFilterChange,
  getSelectedLocationText,
  cities,
  districts, // <-- Use this
  communes, // <-- Use this
}: LocationDropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={() => toggleDropdown("location")}
        className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md min-w-[140px] justify-between"
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700 truncate">
            {getSelectedLocationText()}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            dropdownStates.location ? "rotate-180" : ""
          }`}
        />
      </button>
      {dropdownStates.location && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                value={filters.city_id}
                onChange={(e) => handleFilterChange("city_id", e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            {filters.city_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                <select
                  value={filters.district_id}
                  onChange={(e) =>
                    handleFilterChange("district_id", e.target.value)
                  }
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Districts</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {filters.district_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commune
                </label>
                <select
                  value={filters.commune_id}
                  onChange={(e) =>
                    handleFilterChange("commune_id", e.target.value)
                  }
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Communes</option>
                  {communes.map((commune) => (
                    <option key={commune.id} value={commune.id}>
                      {commune.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
