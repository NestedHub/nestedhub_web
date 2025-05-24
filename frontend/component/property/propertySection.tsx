import Link from "next/link"
import PropertyCard from "./propertyCard"

interface PropertySectionProps {
  title: string
  properties: {
    id: string
    title: string
    type: string
    price: string
    location: string
    bedrooms: number
    bathrooms: number
    image: string // Required image field
  }[]
  viewAllLink?: string
  maxItems?: number
}

export default function PropertySection({
  title,
  properties,
  viewAllLink,
  maxItems = 3, // Default to showing 3 items (one row on desktop)
}: PropertySectionProps) {
  // Limit the number of properties to display
  const displayProperties = properties.slice(0, maxItems)

  // Check if we have more properties than we're displaying
  const hasMoreProperties = properties.length > maxItems

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {viewAllLink && hasMoreProperties && (
          <Link href={viewAllLink} className="text-green-600 hover:text-green-800 font-medium transition-colors">
            View All
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}
