"use client";

import { formatDuration } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

type ThumbnailProps = {
  duration: number | null;
  imageUrl?: string | null;
  previewUrl?: string | null;
  title?: string;
};

export default function Thumbnail({
  duration,
  imageUrl,
  previewUrl,
  title = "",
}: ThumbnailProps) {
  const [src, setSrc] = useState(imageUrl || "/placeholder.svg");

  return (
    <div
      onMouseEnter={() => previewUrl && setSrc(previewUrl)}
      onMouseLeave={() => imageUrl && setSrc(imageUrl)}
      className="relative overflow-hidden rounded-md aspect-video w-36"
    >
      <Image
        src={src}
        alt={title}
        unoptimized={!!previewUrl}
        fill
        className="object-cover transition-opacity duration-200"
      />
      {/* Video duration box */}
      <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
        {duration && formatDuration(duration)}
      </div>
    </div>
  );
}
