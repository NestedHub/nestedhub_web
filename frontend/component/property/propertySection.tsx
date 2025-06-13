// component/property/propertySection.tsx
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import PropertyCard from "@/component/property/propertyCard"
import { WishListResponse } from "@/lib/types"; // Import WishListResponse type

interface PropertySectionProps {
  title: string
  properties: {
    id: string
    title: string
    category: string
    price: string
    location: string
    bedrooms: number
    bathrooms: number
    image: string
  }[]
  viewAllLink?: string
  maxItems?: number
  icon?: React.ReactNode;
  // NEW: Props to pass down to PropertyCard
  userWishlist: WishListResponse[];
  onWishlistChange: (propertyId: string, isWishlisted: boolean) => void;
}

export default function PropertySection({
  title,
  properties,
  viewAllLink,
  maxItems = 3,
  icon,
  userWishlist, // Receive userWishlist
  onWishlistChange // Receive callback
}: PropertySectionProps) {
  const displayProperties = properties.slice(0, maxItems)
  const hasMoreProperties = properties.length > maxItems

  return (
    <section className="mb-20">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-700 rounded-xl">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 mt-1">Discover the best {title.toLowerCase()} available</p>
          </div>
        </div>

        {viewAllLink && hasMoreProperties && (
          <Link
            href={viewAllLink}
            className="group flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <span>View All ({properties.length})</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        )}
      </div>

      {displayProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProperties.map((property, index) => {
            // Determine if the property is in the user's wishlist
            const initialIsWishlisted = userWishlist.some(
              (item) => String(item.property_id) === String(property.id)
            );
            return (
              <div
                key={property.id}
                className="group"
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                <div className="transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <PropertyCard
                    property={property}
                    initialIsWishlisted={initialIsWishlisted} // Pass the determined status
                    onWishlistChange={onWishlistChange} // Pass the callback
                    isUserAuthenticated={true} // TODO: Replace with actual authentication state
                    isUserLoading={false} // TODO: Replace with actual loading state
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 border border-gray-200">
            <div className="text-6xl mb-4">🏠</div>
            <div className="text-gray-600 text-xl mb-2">No properties available</div>
            <p className="text-gray-500">Check back later for new listings in this category.</p>
          </div>
        </div>
      )}

      <div className="mt-16 flex justify-center">
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full"></div>
      </div>
    </section>
  )
}