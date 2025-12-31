"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

import { UserAvatar } from "@/components/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";

import { UserInfo } from "@/modules/users/ui/components/user-info";
import Thumbnail from "./video-thumbnail";
import { VideoMenu } from "./video-menu";

import { cn } from "@/lib/utils";

import type { SuggestionVideo } from "@/modules/suggestions/types";

interface VideoGridCardProps {
  video: SuggestionVideo;
  className?: string;
}

export const VideoGridCard = ({ video, className }: VideoGridCardProps) => {
  const formattedDate = formatDistanceToNow(new Date(video.createdAt), {
    addSuffix: true,
  });

  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(video.viewsCount);
  }, [video.viewsCount]);

  return (
    <div className={cn("flex flex-col space-y-3", className)}>
      <Link href={`/videos/${video.id}`}>
        <Thumbnail
          duration={video.duration}
          imageUrl={video.thumbnailUrl}
          previewUrl={video.previewUrl}
          title={video.title}
          className="w-full aspect-video"
        />
      </Link>

      <div className="flex gap-3">
        <Link href={`/users/${video.user.id}`}>
          <UserAvatar
            src={video.user.imageUrl}
            firstName={video.user.name.split(" ")[0]}
            lastName={video.user.name.split(" ")[1]}
            size="default"
            className="flex-shrink-0 mt-1"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/videos/${video.id}`}>
            <h3 className="font-medium line-clamp-2 text-gray-900">
              {video.title}
            </h3>
          </Link>

          <Link href={`/users/${video.user.id}`}>
            <UserInfo name={video.user.name} />
          </Link>

          <div className="text-sm text-muted-foreground">
            <span>{compactViews} views</span>
            <span className="mx-1">•</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="flex-shrink-0 self-start">
          <VideoMenu videoId={video.id} />
        </div>
      </div>
    </div>
  );
};

interface VideoGridCardSkeletonProps {
  className?: string;
}

export const VideoGridCardSkeleton = ({
  className,
}: VideoGridCardSkeletonProps) => {
  return (
    <div className={cn("flex flex-col space-y-3", className)}>
      <Skeleton className="w-full aspect-video rounded-lg" />

      <div className="flex gap-3">
        <Skeleton className="h-9 w-9 rounded-full flex-shrink-0 mt-1" />

        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <Skeleton className="h-5 w-full mb-1" />
            <Skeleton className="h-5 w-3/4" />
          </div>

          <Skeleton className="h-4 w-32 mb-1" />

          <Skeleton className="h-4 w-28" />
        </div>

        <div className="flex-shrink-0 self-start">
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </div>
    </div>
  );
};
