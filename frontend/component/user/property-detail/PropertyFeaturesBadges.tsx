// components/user/property-detail/PropertyFeaturesBadges.tsx
import { Badge } from "@/component/ui/badge";
// import { PropertyFeature } from '@/lib/properties-type'; // No longer need this if features is string[]

interface PropertyFeaturesBadgesProps {
  features: string[]; // <--- CHANGE THIS: Expect an array of strings
}

export function PropertyFeaturesBadges({ features }: PropertyFeaturesBadgesProps) {
  if (!features || features.length === 0) {
    return null; // Don't render if no features
  }

  return (
    <div className="py-6 border-b border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Features & Amenities</h2>
      <div className="flex flex-wrap gap-3">
        {features.map((feature, index) => ( // Use index as key since features are now strings
          <Badge key={index} variant="secondary" className="px-4 py-2 text-md font-medium bg-gray-100 text-gray-800 rounded-full">
            {feature} {/* Access feature directly as it's already a string */}
          </Badge>
        ))}
      </div>
    </div>
  );
}