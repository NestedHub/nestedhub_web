// components/user/property-detail/PropertyImageGallery.tsx

import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/component/ui/button";
import { Share2 } from "lucide-react";
import { ApiPropertyMedia } from "@/lib/properties-type"; // Import the API type

// Rename MediaItem to something more descriptive if it's strictly for this component
// Or just remove it and use ApiPropertyMedia directly
// interface MediaItem {
//   id: number; // Not needed if using media_id
//   url: string; // Not needed if using media_url
//   is_main: boolean; // Needs logic to derive from media_type if used
// }

interface PropertyImageGalleryProps {
  title: string;
  media: ApiPropertyMedia[]; // Change this to use the API type directly
}

export function PropertyImageGallery({
  title,
  media,
}: PropertyImageGalleryProps) {
  // Determine the initial main image based on API data
  const [mainImage, setMainImage] = useState<string>("/placeholder.svg");

  useEffect(() => {
    if (media && media.length > 0) {
      // Find the first image with media_type 'image' to be the main, or just the first item's URL
      const initialMainUrl =
        media.find((m) => m.media_type === "image")?.media_url ||
        media[0].media_url;
      setMainImage(initialMainUrl || "/placeholder.svg"); // Ensure a fallback
    } else {
      setMainImage("/placeholder.svg");
    }
  }, [media]);

  return (
    <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden shadow-md">
      {/* Main Image */}
      {mainImage && ( // Render only if mainImage is available
        <Image
          src={mainImage}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      )}

      {/* Share Button - Add if desired, was in original file structure but not in function body */}
      {/* <Button
        variant="secondary"
        className="absolute top-4 right-4 flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" /> Share
      </Button> */}

      {/* Thumbnail Navigation */}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 max-w-[80%]">
        {media.slice(0, 5).map((mediaItem, index) => (
          // Filter to show only image thumbnails if desired
          mediaItem.media_type === "image" && (
            <button
              key={mediaItem.media_id} // Use media_id for a stable key
              onClick={() => setMainImage(mediaItem.media_url)} // Use media_url
              className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200
                          ${
                            mainImage === mediaItem.media_url
                              ? "border-green-500"
                              : "border-transparent hover:border-gray-300"
                          }`}
            >
              <Image
                src={mediaItem.media_url} // Use media_url
                alt={`Thumbnail ${index + 1}`}
                width={64}
                height={64}
                objectFit="cover"
              />
            </button>
          )
        ))}
      </div>
    </div>
  );
}