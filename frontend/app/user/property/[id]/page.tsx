import { notFound } from "next/navigation"
import Image from "next/image"
import { Bed, Bath, MapPin, Heart, Share2, Star, ArrowLeft, ArrowRight } from "lucide-react"
import Header from "@/component/user/header"
import Footer from "@/component/user/footer"
import { getPropertyById, getRelatedProperties } from "@/lib/mockData/properties"
import Link from "next/link"

interface PropertyDetailPageProps {
  params: {
    id: string
  }
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const property = await getPropertyById(params.id)

  if (!property) {
    notFound()
  }

  // Get related properties
  const relatedProperties = await getRelatedProperties(property.id, 3)

  // Get primary image or first image or use placeholder
  const primaryImage = property.images?.find((img) => img.isPrimary) || property.images?.[0] || { url: "/property.png" }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Property Images */}
        <div className="relative mb-6 rounded-lg overflow-hidden">
          <div className="relative h-96">
            <Image
              src={
                primaryImage.url && primaryImage.url.trim() !== ""
                  ? primaryImage.url
                  : "/placeholder.svg?height=600&width=800"
              }
              alt={property.title}
              fill
              className="object-cover"
            />
            <button className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md">
              <ArrowRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Property Title and Actions */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{property.title}</h1>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl font-bold text-gray-800 mb-2">{property.price}</p>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{property.location}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="bg-white border border-gray-300 rounded-full p-2">
                <Heart className="h-5 w-5 text-gray-600" />
              </button>
              <button className="bg-white border border-gray-300 rounded-full p-2">
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center">
            <Bed className="w-5 h-5 mr-2 text-gray-600" />
            <div>
              <p className="text-sm text-gray-500">Bedrooms</p>
              <p className="font-medium">{property.bedrooms}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Bath className="w-5 h-5 mr-2 text-gray-600" />
            <div>
              <p className="text-sm text-gray-500">Bathrooms</p>
              <p className="font-medium">{property.bathrooms}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 mr-2 flex items-center justify-center">
              <span className="text-xs font-bold">m²</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Floor Area (m²)</p>
              <p className="font-medium">{property.size || "N/A"} m²</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{property.description || "No description available."}</p>
        </div>

        {/* Property Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Property Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Property Type/House</p>
              <p className="font-medium">{property.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Property ID</p>
              <p className="font-medium">{property.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">List Date</p>
              <p className="font-medium">
                {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Update date</p>
              <p className="font-medium">
                {property.updatedAt ? new Date(property.updatedAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Facilities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Facilities</h2>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <div key={amenity.id} className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  {amenity.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* For Rent */}
        {property.forRent && property.forRent.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">For Rent</h2>
            <div className="flex flex-wrap gap-2">
              {property.forRent.map((option) => (
                <div
                  key={option.id}
                  className={`px-3 py-1 rounded-full text-sm ${
                    option.available ? "bg-green-800 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {option.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Places */}
        {property.nearbyPlaces && property.nearbyPlaces.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Nearby Places</h2>
            <div className="bg-gray-100 rounded-lg overflow-hidden h-64 relative">
              <Image src="/map-placeholder.png" alt="Map showing property location" fill className="object-cover" />
            </div>
            <div className="mt-4 space-y-2">
              {property.nearbyPlaces.map((place, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">{place}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rating and Reviews */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Rating and Review</h2>
          {property.rating ? (
            <div className="flex items-center mb-4">
              <div className="flex mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(property.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-medium">{property.rating.toFixed(1)}</span>
              <span className="text-gray-500 ml-2">({property.reviews || 0} reviews)</span>
            </div>
          ) : (
            <p className="text-gray-500">No ratings yet</p>
          )}
        </div>

        {/* Related Houses */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Related house</h2>
            <Link href="/user/listings" className="text-green-800 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProperties.map((relatedProperty) => {
              const relatedImage = relatedProperty.images?.[0]?.url || "/property.png"
              return (
                <div key={relatedProperty.id} className="bg-white rounded-lg overflow-hidden shadow-md">
                  <div className="relative">
                    <Image
                      src={relatedImage && relatedImage.trim() !== "" ? relatedImage : "/property.png"}
                      alt={relatedProperty.title}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover"
                    />
                    {relatedProperty.rating && (
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                          <span>{relatedProperty.rating}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-sm mb-1">{relatedProperty.title}</h3>
                    <p className="font-bold text-sm mb-1">Price: {relatedProperty.price}</p>
                    <div className="flex items-center text-xs text-gray-600 mb-3">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>Location: {relatedProperty.location}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  )
}
