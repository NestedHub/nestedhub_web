// component/user/property-detail/PropertyDetailsSection.tsx
import { Badge } from "@/component/ui/badge";
import { Button } from "@/component/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/component/ui/avatar";
import { MapPin, Bed, Bath, Square, CalendarDays, Heart } from "lucide-react";
import { Property, User } from '@/lib/types'; // Assuming you have these types
import { formatDate } from "@/lib/utils/helpers"; // Import the helper

interface PropertyDetailsSectionProps {
  property: Property;
  owner?: User;
}

export function PropertyDetailsSection({ property, owner }: PropertyDetailsSectionProps) {
  return (
    <div className="space-y-8">
      {/* Property Title and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 mb-2 px-3 py-1 text-sm font-semibold">
              {property.category_name}
          </Badge>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">{property.title}</h1>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-2 text-green-600" />
            <span className="text-lg">{`${property.location.street_number}, ${property.location.commune_name}, ${property.location.district_name}, ${property.location.city_name}`}</span>
          </div>
          <div className="text-3xl font-extrabold text-green-700 mt-4">
              ${property.pricing.rent_price} / Month
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center space-x-3 mt-4 sm:mt-0">
          <Button variant="outline" size="icon" className="rounded-full w-10 h-10 text-gray-600 hover:bg-gray-100 hover:text-red-500 transition-colors">
            <Heart className="w-5 h-5" />
          </Button>
            {/* Property Owner Info */}
          <Avatar className="w-12 h-12 border-2 border-green-600">
            <AvatarImage src={owner?.profile_picture_url || "/placeholder-avatar.jpg"} alt={owner?.name || "Property Owner"} />
            <AvatarFallback className="text-green-800 bg-green-100 text-xl">{owner?.name ? owner.name.charAt(0) : "PO"}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
              <p className="font-semibold text-gray-800">{owner?.name || "Property Owner"}</p>
              <p className="text-gray-600">Lister</p>
          </div>
        </div>
      </div>

      {/* Property Features */}
      <div className="flex flex-wrap items-center gap-6 py-5 border-y border-gray-200">
        <div className="flex items-center space-x-2">
          <Bed className="w-5 h-5 text-green-600" />
          <span className="text-base text-gray-700 font-medium">{property.bedrooms} Bedrooms</span>
        </div>
        <div className="flex items-center space-x-2">
          <Bath className="w-5 h-5 text-green-600" />
          <span className="text-base text-gray-700 font-medium">{property.bathrooms} Bathrooms</span>
        </div>
        <div className="flex items-center space-x-2">
          <Square className="w-5 h-5 text-green-600" />
          <span className="text-base text-gray-700 font-medium">Floor Area: {property.floor_area} m²</span>
        </div>
        {property.land_area && (
          <div className="flex items-center space-x-2">
            <Square className="w-5 h-5 text-green-600" />
            <span className="text-base text-gray-700 font-medium">Land Area: {property.land_area}</span>
          </div>
        )}
        {property.status && (
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-green-600" />
                <span className="text-base text-gray-700 font-medium">Status: <span className="capitalize">{property.status}</span></span>
            </div>
        )}
          {property.pricing.available_from && (
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-green-600" />
                <span className="text-base text-gray-700 font-medium">Available From: {formatDate(property.pricing.available_from)}</span>
            </div>
          )}
      </div>
    </div>
  );
}