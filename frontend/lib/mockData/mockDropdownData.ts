export const cities = [
  { id: 1, name: "Phnom Penh" },
  { id: 2, name: "Siem Reap" },
  { id: 3, name: "Battambang" },
]

export const districts = [
  { id: 1, name: "Chamkar Mon", city_id: 1 },
  { id: 2, name: "Daun Penh", city_id: 1 },
  { id: 3, name: "7 Makara", city_id: 1 },
]

export const communes = [
  { id: 1, name: "Tonle Bassac", district_id: 1 },
  { id: 2, name: "Boeung Keng Kang", district_id: 1 },
  { id: 3, name: "Phsar Kandal", district_id: 2 },
]

export const propertyCategories = [
  { id: 1, name: "House" },
  { id: 2, name: "Apartment" },
  { id: 3, name: "Room" },
  { id: 4, name: "Commercial" },
]

export const sortOptions = [
  { value: "listed_at", label: "Latest Listed", order: "desc" },
  { value: "rent_price", label: "Price: Low to High", order: "asc" },
  { value: "rent_price", label: "Price: High to Low", order: "desc" },
  { value: "bedrooms", label: "Most Bedrooms", order: "desc" },
  { value: "floor_area", label: "Largest Area", order: "desc" },
]