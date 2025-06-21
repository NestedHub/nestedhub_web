// components/user/property-detail/PropertyOverviewTable.tsx
import { Property } from '@/lib/properties-type'; // Ensure this path is correct for your Property type
import { formatDate } from "@/lib/utils/helpers"; // Import the helper

interface PropertyOverviewTableProps {
  property: Property; // This prop now strictly adheres to the API's Property type
}

export function PropertyOverviewTable({ property }: PropertyOverviewTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6"> {/* Added some basic styling to match your previous version */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Property Overview</h2>
      <div className="grid md:grid-cols-2 gap-4 text-gray-700">
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-gray-600">Property Category:</span>
            <span className="font-semibold">{property.category_name}</span> {/* Correctly accesses category_name */}
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-gray-600">Listed Date:</span>
            <span className="font-semibold">{formatDate(property.listed_at)}</span> {/* Uses listed_at and formatDate */}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Property ID:</span>
            <span className="font-semibold">{property.property_id}</span> {/* Correctly accesses property_id */}
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-gray-600">Last Updated:</span>
            <span className="font-semibold">{formatDate(property.updated_at)}</span> {/* Uses updated_at and formatDate */}
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-gray-600">Status:</span>
            <span className="font-semibold capitalize">{property.status}</span> {/* Correctly accesses status */}
          </div>
          {/* Conditional rendering for pricing details, checking if they exist */}
          {property.pricing.electricity_price && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Electricity Price:</span>
              <span className="font-semibold">{property.pricing.electricity_price}</span>
            </div>
          )}
          {property.pricing.water_price && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Water Price:</span>
              <span className="font-semibold">{property.pricing.water_price}</span>
            </div>
          )}
          {property.pricing.other_price && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Other Costs:</span>
              <span className="font-semibold">{property.pricing.other_price}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}