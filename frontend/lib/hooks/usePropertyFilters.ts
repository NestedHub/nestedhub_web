import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

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
  const searchParams = useSearchParams()

  const [cities, setCities] = useState<{ id: number; name: string }[]>([])
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>([])
  const [communes, setCommunes] = useState<{ id: number; name: string }[]>([])
  const [propertyCategories, setPropertyCategories] = useState<{ id: number; name: string }[]>([])
  const [sortOptions] = useState(SORT_OPTIONS)

  // Initialize searchQuery from URL on mount
  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams.get("keyword") || ""
  })

  const [filters, setFilters] = useState<Filters>(() => {
    const initialFiltersFromUrl: Partial<Filters> = {}
    searchParams.forEach((value, key) => {
      if (key in initialFiltersFromUrl || ['city_id', 'district_id', 'commune_id', 'category_id', 'sort_by', 'sort_order'].includes(key)) {
          (initialFiltersFromUrl as any)[key] = value
      }
    })

    return {
      city_id: initialFiltersFromUrl.city_id || "",
      district_id: initialFiltersFromUrl.district_id || "",
      commune_id: initialFiltersFromUrl.commune_id || "",
      category_id: initialFiltersFromUrl.category_id || "",
      sort_by: initialFiltersFromUrl.sort_by || "listed_at",
      sort_order: initialFiltersFromUrl.sort_order || "desc",
    }
  })

  const [dropdownStates, setDropdownStates] = useState({
    location: false,
    propertyCategory: false,
    priceSort: false,
  })

  // Effect to re-sync ONLY filters (not searchQuery) with URL if searchParams change
  useEffect(() => {
    console.log("usePropertyFilters: URL searchParams Effect triggered for filters. Parsing URL:", searchParams.toString());

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
        return prevFilters;
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
  }, [])

  // Fetch districts when city_id changes
  useEffect(() => {
    console.log("usePropertyFilters: City ID changed:", filters.city_id)

    if (!filters.city_id) {
      setDistricts([])
      setCommunes([])
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

    setFilters((prev) => ({ ...prev, district_id: "", commune_id: "" }))
    setCommunes([])
  }, [filters.city_id])

  // Fetch communes when district_id changes
  useEffect(() => {
    console.log("usePropertyFilters: District ID changed:", filters.district_id)

    if (!filters.district_id) {
      setCommunes([])
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

    setFilters((prev) => ({ ...prev, commune_id: "" }))
  }, [filters.district_id])

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
  }, [])

  const handleSortChange = useCallback((sortBy: string, sortOrder: string) => {
    console.log("usePropertyFilters: Sort change: ", sortBy, sortOrder)
    setFilters((prev) => ({ ...prev, sort_by: sortBy, sort_order: sortOrder }))
  }, [])

  const clearFilters = useCallback(() => {
    console.log("usePropertyFilters: Clearing filters and searchQuery")
    setFilters({
      city_id: "",
      district_id: "",
      commune_id: "",
      category_id: "",
      sort_by: "listed_at",
      sort_order: "desc",
    })
    setSearchQuery("") // This correctly clears the input field
  }, [])

  const toggleDropdown = useCallback((dropdown: keyof typeof dropdownStates) => {
    console.log("usePropertyFilters: Toggling dropdown:", dropdown)
    setDropdownStates((prev) => ({
      ...prev,
      [dropdown]: !prev[dropdown],
    }))
  }, [])

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
  }, [filters.commune_id, filters.district_id, filters.city_id, communes, districts, cities])

  const getSelectedPropertyCategoryText = useCallback(() => {
    if (filters.category_id) {
      const category = propertyCategories.find((c) => c.id.toString() === filters.category_id)
      return category?.name
    }
    return "All Categories"
  }, [filters.category_id, propertyCategories])

  const getSelectedSortText = useCallback(() => {
    const option = sortOptions.find(
      (opt) => opt.value === filters.sort_by && opt.order === filters.sort_order
    )
    return option?.label || "Latest Listed"
  }, [filters.sort_by, filters.sort_order, sortOptions])


  return {
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
    sortOptions,
  }
}