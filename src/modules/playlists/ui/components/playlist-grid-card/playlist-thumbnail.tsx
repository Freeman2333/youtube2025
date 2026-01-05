import Image from "next/image";
import { ListVideo, Play } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { PLACEHOLDER_IMAGE } from "@/constants";

interface PlaylistThumbnailProps {
  imageUrl?: string;
  videoCount?: number;
}

export const PlaylistThumbnail = ({
  imageUrl = PLACEHOLDER_IMAGE,
  videoCount = 0,
}: PlaylistThumbnailProps) => {
  return (
    <div className="relative pt-3">
      <div className="absolute top-0.5 left-[4%] right-[4%] h-2 bg-gray-300 rounded-t-lg" />
      <div className="absolute top-1.5 left-[2%] right-[2%] h-2 bg-gray-400 rounded-t-lg" />

      <div className="relative bg-neutral-800 aspect-video rounded-xl overflow-hidden">
        <Image
          src={imageUrl}
          alt="playlist thumbnail"
          className="size-full object-cover"
          fill
        />

        <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-white flex items-center gap-2">
            <Play className="size-5 fill-current" />
            <span className="font-medium">Play all</span>
          </div>
        </div>

        <div className="absolute right-2 bottom-2 bg-black/80 text-white text-xs rounded px-2 py-1 flex items-center gap-1">
          <ListVideo className="size-4" />
          <span>
            {videoCount} video{videoCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
};

export const PlaylistThumbnailSkeleton = () => {
  return (
    <div className="relative pt-3">
      <Skeleton className="aspect-video rounded-xl" />
    </div>
  );
};
