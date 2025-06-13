// components/user/property-detail/PropertyImageGallery.tsx
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/component/ui/button";
import { Share2 } from "lucide-react";

interface MediaItem {
  id: number;
  url: string;
  is_main: boolean;
}

interface PropertyImageGalleryProps {
  title: string;
  media: MediaItem[];
}

export function PropertyImageGallery({
  title,
  media,
}: PropertyImageGalleryProps) {
  const [mainImage, setMainImage] = useState<string>("/placeholder.svg");

  useEffect(() => {
    if (media && media.length > 0) {
      setMainImage(media.find((m) => m.is_main)?.url || media[0].url);
    } else {
      setMainImage("/placeholder.svg");
    }
  }, [media]);

  return (
    <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden shadow-md">
      {/* Main Image */}
      <Image
        src={mainImage}
        alt={title}
        layout="fill"
        objectFit="cover"
        className="rounded-lg"
      />
      {/* Thumbnail Navigation */}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 max-w-[80%]">
        {media.slice(0, 5).map((mediaItem, index) => (
          <button
            // Defensive key: Use mediaItem.id if available, otherwise fallback to index.
            // But prefer ensuring mediaItem.id is always valid.
            key={
              mediaItem.id !== undefined && mediaItem.id !== null
                ? mediaItem.id
                : index
            }
            onClick={() => setMainImage(mediaItem.url)}
            className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200
                        ${
                          mainImage === mediaItem.url
                            ? "border-green-500"
                            : "border-transparent hover:border-gray-300"
                        }`}
          >
            <Image
              src={mediaItem.url}
              alt={`Thumbnail ${index + 1}`}
              width={64}
              height={64}
              objectFit="cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
