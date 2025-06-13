// components/user/property-detail/PropertyFeaturesBadges.tsx
import { Badge } from "@/component/ui/badge";

interface PropertyFeaturesBadgesProps {
  features: string[];
}

export function PropertyFeaturesBadges({ features }: PropertyFeaturesBadgesProps) {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Key Features & Facilities</h2>
      <div className="flex flex-wrap gap-3">
        {features.map((feature, index) => (
          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 px-3 py-1 text-sm font-medium rounded-full">
            {feature}
          </Badge>
        ))}
      </div>
    </div>
  );
}