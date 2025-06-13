import { Search, MapPin, Building2, ArrowUpDown } from "lucide-react";
import React from "react";

interface Filters {
  city_id: string;
  district_id: string;
  commune_id: string;
  category_id: string;
  sort_by: string;
  sort_order: string;
}

interface DropdownStates {
  location: boolean;
  propertyCategory: boolean;
  priceSort: boolean;
}

interface FilterSectionProps {
  filters: Filters;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  dropdownStates: DropdownStates;
  toggleDropdown: (dropdown: keyof DropdownStates) => void;
  handleFilterChange: (key: keyof Filters, value: string) => void;
  handleSortChange: (sortBy: string, sortOrder: string) => void;
  clearFilters: () => void;
  getSelectedLocationText: () => string;
  getSelectedPropertyCategoryText: () => string;
  getSelectedSortText: () => string;
  cities: { id: number | string; name: string }[];
  districts: { id: number | string; name: string }[];
  communes: { id: number | string; name: string }[];
  propertyCategories: { id: number | string; name: string }[];
  onSearch?: () => void;
}

// Simple Location Dropdown Component
const LocationDropdown = ({
  filters,
  dropdownStates,
  toggleDropdown,
  handleFilterChange,
  getSelectedLocationText,
  cities,
  districts,
  communes,
}: any) => (
  <div className="relative">
    <button
      type="button"
      onClick={() => toggleDropdown("location")}
      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-10"
    >
      <div className="flex items-center h-full">
        <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
        <span className="text-gray-700 truncate">
          {getSelectedLocationText() || "Select Location"}
        </span>
      </div>
    </button>

    {dropdownStates.location && (
      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
        <div className="p-2 space-y-2">
          <select
            value={filters.city_id}
            onChange={(e) => handleFilterChange("city_id", e.target.value)}
            className="w-full p-2 border border-gray-200 rounded text-sm"
          >
            <option value="">Select City/Province</option>
            {cities.map((city: { id: number | string; name: string }) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>

          {filters.city_id && (
            <select
              value={filters.district_id}
              onChange={(e) => handleFilterChange("district_id", e.target.value)}
              className="w-full p-2 border border-gray-200 rounded text-sm"
            >
              <option value="">Select District</option>
              {districts.map((district: { id: number | string; name: string }) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          )}

          {filters.district_id && (
            <select
              value={filters.commune_id}
              onChange={(e) => handleFilterChange("commune_id", e.target.value)}
              className="w-full p-2 border border-gray-200 rounded text-sm"
            >
              <option value="">Select Commune</option>
              {communes.map((commune: { id: number | string; name: string }) => (
                <option key={commune.id} value={commune.id}>
                  {commune.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    )}
  </div>
);

// Simple Property Category Dropdown
const PropertyCategoryDropdown = ({
  filters,
  dropdownStates,
  toggleDropdown,
  handleFilterChange,
  getSelectedPropertyCategoryText,
  propertyCategories,
}: any) => (
  <div className="relative">
    <button
      type="button"
      onClick={() => toggleDropdown("propertyCategory")}
      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-10"
    >
      <div className="flex items-center h-full">
        <Building2 className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
        <span className="text-gray-700 truncate">
          {getSelectedPropertyCategoryText() || "Property Type"}
        </span>
      </div>
    </button>

    {dropdownStates.propertyCategory && (
      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
        <div className="p-2">
          <select
            value={filters.category_id}
            onChange={(e) => handleFilterChange("category_id", e.target.value)}
            className="w-full p-2 border border-gray-200 rounded text-sm"
          >
            <option value="">All Property Types</option>
            {propertyCategories.map((category: { id: number | string; name: string }) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    )}
  </div>
);

// Simple Sort Dropdown
const SortDropdown = ({
  dropdownStates,
  toggleDropdown,
  handleSortChange,
  getSelectedSortText,
}: any) => (
  <div className="relative">
    <button
      type="button"
      onClick={() => toggleDropdown("priceSort")}
      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-10"
    >
      <div className="flex items-center h-full">
        <ArrowUpDown className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
        <span className="text-gray-700 truncate">
          {getSelectedSortText() || "Sort By"}
        </span>
      </div>
    </button>

    {dropdownStates.priceSort && (
      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
        <div className="p-2">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleSortChange("rent_price", "asc")}
              className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
            >
              Price: Low to High
            </button>
            <button
              type="button"
              onClick={() => handleSortChange("rent_price", "desc")}
              className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
            >
              Price: High to Low
            </button>
            <button
              type="button"
              onClick={() => handleSortChange("listed_at", "desc")}
              className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
            >
              Newest First
            </button>
            <button
              type="button"
              onClick={() => handleSortChange("listed_at", "asc")}
              className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
            >
              Oldest First
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default function FilterSection({
  filters,
  searchQuery,
  setSearchQuery,
  dropdownStates,
  toggleDropdown,
  handleFilterChange,
  handleSortChange,
  clearFilters,
  getSelectedLocationText,
  getSelectedPropertyCategoryText,
  getSelectedSortText,
  cities,
  districts,
  communes,
  propertyCategories,
  onSearch,
}: FilterSectionProps) {
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
            />
          </div>
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <LocationDropdown
            filters={filters}
            dropdownStates={dropdownStates}
            toggleDropdown={toggleDropdown}
            handleFilterChange={handleFilterChange}
            getSelectedLocationText={getSelectedLocationText}
            cities={cities}
            districts={districts}
            communes={communes}
          />
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <PropertyCategoryDropdown
            filters={filters}
            dropdownStates={dropdownStates}
            toggleDropdown={toggleDropdown}
            handleFilterChange={handleFilterChange}
            getSelectedPropertyCategoryText={getSelectedPropertyCategoryText}
            propertyCategories={propertyCategories}
          />
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort
          </label>
          <SortDropdown
            dropdownStates={dropdownStates}
            toggleDropdown={toggleDropdown}
            handleSortChange={handleSortChange}
            getSelectedSortText={getSelectedSortText}
          />
        </div>

        <div className="md:col-span-1">
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium h-10"
          >
            Search
          </button>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            clearFilters();
          }}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}