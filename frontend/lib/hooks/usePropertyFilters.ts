import { useState, useEffect } from "react"

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
  const [cities, setCities] = useState<{ id: number; name: string }[]>([])
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>([])
  const [communes, setCommunes] = useState<{ id: number; name: string }[]>([])
  const [propertyCategories, setPropertyCategories] = useState<{ id: number; name: string }[]>([])
  const [sortOptions] = useState(SORT_OPTIONS)

  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<Filters>({
    city_id: "",
    district_id: "",
    commune_id: "",
    category_id: "",
    sort_by: "listed_at",
    sort_order: "desc",
  })
  const [dropdownStates, setDropdownStates] = useState({
    location: false,
    propertyCategory: false,
    priceSort: false,
  })

  // Fetch cities and property categories on mount
  useEffect(() => {
    fetch(API_CITIES)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item: { city_id: number; city_name: string }) => ({
          id: item.city_id,
          name: item.city_name,
        }))
        console.log("Fetched cities:", formatted)
        setCities(formatted)
      })
      .catch((err) => {
        console.error("Error fetching cities", err)
        setCities([])
      })

    fetch(API_PROPERTY_CATEGORIES)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item: { category_id: number; category_name: string }) => ({
          id: item.category_id,
          name: item.category_name,
        }))
        console.log("Fetched property categories:", formatted)
        setPropertyCategories(formatted)
      })
      .catch((err) => {
        console.error("Error fetching property categories", err)
        setPropertyCategories([])
      })
  }, [])

  // Fetch districts when city_id changes
  useEffect(() => {
    console.log("City ID changed:", filters.city_id)

    if (!filters.city_id) {
      setDistricts([])
      setCommunes([])
      setFilters((prev) => ({ ...prev, district_id: "", commune_id: "" }))
      return
    }

    fetch(API_DISTRICTS(filters.city_id))
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item: { district_id: number; district_name: string }) => ({
          id: item.district_id,
          name: item.district_name,
        }))
        console.log("Fetched districts for city", filters.city_id, ":", formatted)
        setDistricts(formatted)
      })
      .catch((err) => {
        console.error("Error fetching districts", err)
        setDistricts([])
      })

    setFilters((prev) => ({ ...prev, district_id: "", commune_id: "" }))
    setCommunes([])
  }, [filters.city_id])

  // Fetch communes when district_id changes
  useEffect(() => {
    console.log("District ID changed:", filters.district_id)

    if (!filters.district_id) {
      setCommunes([])
      setFilters((prev) => ({ ...prev, commune_id: "" }))
      return
    }

    fetch(API_COMMUNES(filters.district_id))
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item: { commune_id: number; commune_name: string }) => ({
          id: item.commune_id,
          name: item.commune_name,
        }))
        console.log("Fetched communes for district", filters.district_id, ":", formatted)
        setCommunes(formatted)
      })
      .catch((err) => {
        console.error("Error fetching communes", err)
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

  const handleFilterChange = (key: keyof Filters, value: string) => {
    console.log("Filter change:", key, "=>", value)
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    console.log("Sort change: ", sortBy, sortOrder)
    setFilters((prev) => ({ ...prev, sort_by: sortBy, sort_order: sortOrder }))
  }

  const clearFilters = () => {
    console.log("Clearing filters")
    setFilters({
      city_id: "",
      district_id: "",
      commune_id: "",
      category_id: "",
      sort_by: "listed_at",
      sort_order: "desc",
    })
    setSearchQuery("")
  }

  const toggleDropdown = (dropdown: keyof typeof dropdownStates) => {
    console.log("Toggling dropdown:", dropdown)
    setDropdownStates((prev) => ({
      ...prev,
      [dropdown]: !prev[dropdown],
    }))
  }

  const getSelectedLocationText = () => {
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
  }

  const getSelectedPropertyCategoryText = () => {
    if (filters.category_id) {
      const category = propertyCategories.find((c) => c.id.toString() === filters.category_id)
      return category?.name
    }
    return "All Categories"
  }

  const getSelectedSortText = () => {
    const option = sortOptions.find(
      (opt) => opt.value === filters.sort_by && opt.order === filters.sort_order
    )
    return option?.label || "Latest Listed"
  }

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
