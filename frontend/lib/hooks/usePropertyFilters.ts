// lib/hooks/usePropertyFilters.ts
import { useState, useEffect, useCallback } from "react" // Add useCallback
import { useSearchParams } from "next/navigation" // Import useSearchParams

export interface Filters {
  city_id: string
  district_id: string
  commune_id: string
  category_id: string
  sort_by: string
  sort_order: string
}

// === API ENDPOINTS ===
const API_CITIES = "http://localhost:8000/api/properties/filters/cities"
const API_DISTRICTS = (cityId: string) => `http://localhost:8000/api/properties/filters/districts?city_id=${cityId}`
const API_COMMUNES = (districtId: string) => `http://localhost:8000/api/properties/filters/communes?district_id=${districtId}`
const API_PROPERTY_CATEGORIES = "http://localhost:8000/api/properties/filters/categories"

const SORT_OPTIONS = [
  { value: "listed_at", order: "desc", label: "Latest Listed" },
  { value: "listed_at", order: "asc", label: "Oldest Listed" },
  { value: "rent_price", order: "asc", label: "Price: Low to High" },
  { value: "rent_price", order: "desc", label: "Price: High to Low" },
  { value: "bedrooms", order: "asc", label: "Bedrooms: Low to High" },
  { value: "bedrooms", order: "desc", label: "Bedrooms: High to Low" },
  { value: "floor_area", order: "asc", label: "Floor Area: Small to Large" },
  { value: "floor_area", order: "desc", label: "Floor Area: Large to Small" },
]

export function usePropertyFilters() {
  const searchParams = useSearchParams() // Get searchParams inside the hook

  const [cities, setCities] = useState<{ id: number; name: string }[]>([])
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>([])
  const [communes, setCommunes] = useState<{ id: number; name: string }[]>([])
  const [propertyCategories, setPropertyCategories] = useState<{ id: number; name: string }[]>([])
  const [sortOptions] = useState(SORT_OPTIONS)

  // Initialize searchQuery and filters from URL on mount
  // This state initializer runs only once on initial render
  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams.get("keyword") || ""
  })

  const [filters, setFilters] = useState<Filters>(() => {
    const initialFiltersFromUrl: Partial<Filters> = {}
    searchParams.forEach((value, key) => {
      // Ensure the key exists in our Filters type
      if (key in initialFiltersFromUrl || ['city_id', 'district_id', 'commune_id', 'category_id', 'sort_by', 'sort_order'].includes(key)) {
          (initialFiltersFromUrl as any)[key] = value // Cast to any to assign string to specific keys
      }
    })

    return {
      city_id: initialFiltersFromUrl.city_id || "",
      district_id: initialFiltersFromUrl.district_id || "",
      commune_id: initialFiltersFromUrl.commune_id || "",
      category_id: initialFiltersFromUrl.category_id || "",
      sort_by: initialFiltersFromUrl.sort_by || "listed_at", // Default if not in URL
      sort_order: initialFiltersFromUrl.sort_order || "desc", // Default if not in URL
    }
  })

  const [dropdownStates, setDropdownStates] = useState({
    location: false,
    propertyCategory: false,
    priceSort: false,
  })

  // Effect to re-sync state with URL if searchParams change (e.g., browser back/forward, external link)
  // This is crucial to keep the internal state in sync with the URL after navigation not originating from this page's search.
  useEffect(() => {
    console.log("usePropertyFilters: URL searchParams Effect triggered. Parsing URL:", searchParams.toString());

    // Update searchQuery if 'keyword' param changes in URL
    const keywordFromUrl = searchParams.get("keyword") || "";
    if (searchQuery !== keywordFromUrl) {
        console.log(`usePropertyFilters: Syncing searchQuery from URL: '${searchQuery}' -> '${keywordFromUrl}'`);
        setSearchQuery(keywordFromUrl);
    }

    // Update filters if any filter params change in URL
    setFilters(prevFilters => {
        let updatedFilters = { ...prevFilters };
        let changed = false;

        const newCityId = searchParams.get("city_id") || "";
        if (updatedFilters.city_id !== newCityId) {
            updatedFilters.city_id = newCityId;
            changed = true;
        }

        const newDistrictId = searchParams.get("district_id") || "";
        if (updatedFilters.district_id !== newDistrictId) {
            updatedFilters.district_id = newDistrictId;
            changed = true;
        }

        const newCommuneId = searchParams.get("commune_id") || "";
        if (updatedFilters.commune_id !== newCommuneId) {
            updatedFilters.commune_id = newCommuneId;
            changed = true;
        }

        const newCategoryId = searchParams.get("category_id") || "";
        if (updatedFilters.category_id !== newCategoryId) {
            updatedFilters.category_id = newCategoryId;
            changed = true;
        }

        const newSortBy = searchParams.get("sort_by") || "listed_at";
        if (updatedFilters.sort_by !== newSortBy) {
            updatedFilters.sort_by = newSortBy;
            changed = true;
        }

        const newSortOrder = searchParams.get("sort_order") || "desc";
        if (updatedFilters.sort_order !== newSortOrder) {
            updatedFilters.sort_order = newSortOrder;
            changed = true;
        }

        if (changed) {
            console.log("usePropertyFilters: Syncing filters from URL:", updatedFilters);
            return updatedFilters;
        }
        return prevFilters; // No change, return previous state to prevent unnecessary re-renders
    });
  }, [searchParams]); // This effect depends only on searchParams


  // Fetch cities and property categories on mount
  useEffect(() => {
    fetch(API_CITIES)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item: { city_id: number; city_name: string }) => ({
          id: item.city_id,
          name: item.city_name,
        }))
        console.log("usePropertyFilters: Fetched cities:", formatted)
        setCities(formatted)
      })
      .catch((err) => {
        console.error("usePropertyFilters: Error fetching cities", err)
        setCities([])
      })

    fetch(API_PROPERTY_CATEGORIES)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item: { category_id: number; category_name: string }) => ({
          id: item.category_id,
          name: item.category_name,
        }))
        console.log("usePropertyFilters: Fetched property categories:", formatted)
        setPropertyCategories(formatted)
      })
      .catch((err) => {
        console.error("usePropertyFilters: Error fetching property categories", err)
        setPropertyCategories([])
      })
  }, []) // Empty dependency array means this runs once on mount

  // Fetch districts when city_id changes
  useEffect(() => {
    console.log("usePropertyFilters: City ID changed:", filters.city_id)

    if (!filters.city_id) {
      setDistricts([])
      setCommunes([])
      // Do NOT reset filters here directly as it can cause a loop if it's already set by URL.
      // The main useEffect above will handle URL-based changes.
      // This is for cases where city_id is cleared *manually* by a user action in a dropdown.
      setFilters((prev) => ({ ...prev, district_id: "", commune_id: "" }));
      return
    }

    fetch(API_DISTRICTS(filters.city_id))
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item: { district_id: number; district_name: string }) => ({
          id: item.district_id,
          name: item.district_name,
        }))
        console.log("usePropertyFilters: Fetched districts for city", filters.city_id, ":", formatted)
        setDistricts(formatted)
      })
      .catch((err) => {
        console.error("usePropertyFilters: Error fetching districts", err)
        setDistricts([])
      })

    // This ensures consistency when city is changed: clear dependent filters
    // This is safe because it only runs when `filters.city_id` (a dependency) changes.
    setFilters((prev) => ({ ...prev, district_id: "", commune_id: "" }))
    setCommunes([])
  }, [filters.city_id]) // Depend on filters.city_id

  // Fetch communes when district_id changes
  useEffect(() => {
    console.log("usePropertyFilters: District ID changed:", filters.district_id)

    if (!filters.district_id) {
      setCommunes([])
      // Do NOT reset filters here directly as it can cause a loop if it's already set by URL.
      // This is for cases where district_id is cleared *manually* by a user action in a dropdown.
      setFilters((prev) => ({ ...prev, commune_id: "" }));
      return
    }

    fetch(API_COMMUNES(filters.district_id))
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item: { commune_id: number; commune_name: string }) => ({
          id: item.commune_id,
          name: item.commune_name,
        }))
        console.log("usePropertyFilters: Fetched communes for district", filters.district_id, ":", formatted)
        setCommunes(formatted)
      })
      .catch((err) => {
        console.error("usePropertyFilters: Error fetching communes", err)
        setCommunes([])
      })

    // This ensures consistency when district is changed: clear dependent filters
    // This is safe because it only runs when `filters.district_id` (a dependency) changes.
    setFilters((prev) => ({ ...prev, commune_id: "" }))
  }, [filters.district_id]) // Depend on filters.district_id

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(".relative")) {
        setDropdownStates({
          location: false,
          propertyCategory: false,
          priceSort: false,
        })
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Memoize these functions with useCallback for performance and stable dependencies
  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    console.log("usePropertyFilters: Filter change:", key, "=>", value)
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, []) // Empty dependency array as it doesn't depend on outside values

  const handleSortChange = useCallback((sortBy: string, sortOrder: string) => {
    console.log("usePropertyFilters: Sort change: ", sortBy, sortOrder)
    setFilters((prev) => ({ ...prev, sort_by: sortBy, sort_order: sortOrder }))
  }, []) // Empty dependency array

  const clearFilters = useCallback(() => {
    console.log("usePropertyFilters: Clearing filters")
    setFilters({
      city_id: "",
      district_id: "",
      commune_id: "",
      category_id: "",
      sort_by: "listed_at",
      sort_order: "desc",
    })
    setSearchQuery("") // Also clear the search query
  }, []) // Empty dependency array

  const toggleDropdown = useCallback((dropdown: keyof typeof dropdownStates) => {
    console.log("usePropertyFilters: Toggling dropdown:", dropdown)
    setDropdownStates((prev) => ({
      ...prev,
      [dropdown]: !prev[dropdown],
    }))
  }, []) // Empty dependency array

  const getSelectedLocationText = useCallback(() => {
    if (filters.commune_id) {
      const commune = communes.find((c) => c.id.toString() === filters.commune_id)
      const district = districts.find((d) => d.id.toString() === filters.district_id)
      const city = cities.find((c) => c.id.toString() === filters.city_id)
      return `${commune?.name}, ${district?.name}, ${city?.name}`
    }
    if (filters.district_id) {
      const district = districts.find((d) => d.id.toString() === filters.district_id)
      const city = cities.find((c) => c.id.toString() === filters.city_id)
      return `${district?.name}, ${city?.name}`
    }
    if (filters.city_id) {
      const city = cities.find((c) => c.id.toString() === filters.city_id)
      return city?.name
    }
    return "All Locations"
  }, [filters.commune_id, filters.district_id, filters.city_id, communes, districts, cities]) // Dependencies for useCallback

  const getSelectedPropertyCategoryText = useCallback(() => {
    if (filters.category_id) {
      const category = propertyCategories.find((c) => c.id.toString() === filters.category_id)
      return category?.name
    }
    return "All Categories"
  }, [filters.category_id, propertyCategories]) // Dependencies for useCallback

  const getSelectedSortText = useCallback(() => {
    const option = sortOptions.find(
      (opt) => opt.value === filters.sort_by && opt.order === filters.sort_order
    )
    return option?.label || "Latest Listed"
  }, [filters.sort_by, filters.sort_order, sortOptions]) // Dependencies for useCallback


  return {
    filters,
    searchQuery,
    setSearchQuery, // This is the state setter for the input
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
    sortOptions,
  }
}