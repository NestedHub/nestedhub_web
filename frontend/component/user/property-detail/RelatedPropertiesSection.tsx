// components/user/property-detail/RelatedPropertiesSection.tsx
import { Card, CardContent } from "@/component/ui/card";
import { ChevronRight, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function RelatedPropertiesSection() {
  // In a real application, you'd fetch related properties based on the current property's data
  // For now, using placeholders as in the original code.
  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">More Properties Like This</h2>
        <Link href="/user/rent" className="text-green-600 hover:text-green-800 text-lg font-semibold flex items-center transition-colors">
          View all <ChevronRight className="w-5 h-5 ml-1" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((propPlaceholder) => (
          <Card key={propPlaceholder} className="overflow-hidden border-gray-200 shadow-sm transition-transform hover:scale-[1.02] hover:shadow-md">
            <Link href={`/user/property/${propPlaceholder}`}>
                <div className="aspect-[4/3] relative">
                <Image
                    src="/placeholder.svg?height=200&width=300"
                    alt="Related Property"
                    width={300}
                    height={200}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                    4.8
                </div>
                </div>
                <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1 text-gray-800 truncate">Cozy Apartment in City Center</h3>
                <p className="text-green-700 font-bold text-lg mb-2">$800/Month</p>
                <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-gray-400" /> Location: Chamkar Mon, Phnom Penh
                </p>
                </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}