"use client";

import Link from "next/link";
import { useMemo } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { UserAvatar } from "@/components/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";

import { UserInfo } from "@/modules/users/ui/components/user-info";
import Thumbnail from "@/modules/videos/ui/components/video-thumbnail";
import { VideoMenu } from "@/modules/videos/ui/components/video-menu";

import { cn } from "@/lib/utils";

import type { SuggestionVideo } from "@/modules/suggestions/types";

const videoRowCardVariants = cva("flex rounded-lg transition-colors mb-4", {
  variants: {
    variant: {
      default: "gap-4",
      compact: "gap-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface VideoRowCardProps extends VariantProps<typeof videoRowCardVariants> {
  video: SuggestionVideo;
  className?: string;
}

export const VideoRowCard = ({
  video,
  variant,
  className,
}: VideoRowCardProps) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(video.viewsCount);
  }, [video.viewsCount]);

  const compactLikes = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(video.likesCount);
  }, [video.likesCount]);

  const isCompact = variant === "compact";

  return (
    <div className={cn(videoRowCardVariants({ variant }), className)}>
      <Link
        href={`/videos/${video.id}`}
        className={cn({
          "w-[168px]": isCompact,
          "w-[38%]": !isCompact,
        })}
      >
        <Thumbnail
          duration={video.duration}
          imageUrl={video.thumbnailUrl}
          previewUrl={video.previewUrl}
          title={video.title}
          className="w-full"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/videos/${video.id}`}>
          <h3
            className={cn("font-medium line-clamp-2 text-gray-900 mb-1", {
              "text-sm": isCompact,
              "text-base": !isCompact,
            })}
          >
            {video.title}
          </h3>
        </Link>

        <Link href={`/videos/${video.id}`}>
          <div className="text-muted-foreground mb-1 text-xs">
            <span>{compactViews} views</span>
            <span className="mx-1">•</span>
            <span>{compactLikes} likes</span>
          </div>
        </Link>

        <div
          className={cn("flex items-center gap-2", {
            "mb-0.5": isCompact,
            "my-2": !isCompact,
          })}
        >
          {!isCompact && (
            <Link href={`/users/${video.user.id}`}>
              <UserAvatar
                src={video.user.imageUrl}
                firstName={video.user.name.split(" ")[0]}
                lastName={video.user.name.split(" ")[1]}
                size="sm"
              />
            </Link>
          )}
          <Link href={`/users/${video.user.id}`}>
            <UserInfo
              name={video.user.name}
              size="sm"
              className={cn({
                "text-muted-foreground": isCompact,
              })}
            />
          </Link>
        </div>

        {!isCompact && (
          <div className="text-xs text-muted-foreground">
            {video.description ? (
              <span className="line-clamp-1">{video.description}</span>
            ) : (
              <span className="italic">No description</span>
            )}
          </div>
        )}
      </div>
      <div className="flex-shrink-0 self-start">
        <VideoMenu videoId={video.id} />
      </div>
    </div>
  );
};

interface VideoRowCardSkeletonProps
  extends VariantProps<typeof videoRowCardVariants> {
  className?: string;
}

export const VideoRowCardSkeleton = ({
  variant,
  className,
}: VideoRowCardSkeletonProps) => {
  const isCompact = variant === "compact";

  return (
    <div className={cn(videoRowCardVariants({ variant }), className)}>
      <div
        className={cn({
          "w-[168px]": isCompact,
          "w-[38%]": !isCompact,
        })}
      >
        <Skeleton className="aspect-video w-full rounded-lg" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-1">
          <Skeleton
            className={cn("h-4 w-full mb-1", {
              "h-3": isCompact,
            })}
          />
          <Skeleton
            className={cn("h-4 w-3/4", {
              "h-3": isCompact,
            })}
          />
        </div>

        <div className="mb-1">
          <Skeleton className="h-3 w-32" />
        </div>

        <div
          className={cn("flex items-center gap-2", {
            "mb-0.5": isCompact,
            "my-2": !isCompact,
          })}
        >
          {!isCompact && <Skeleton className="h-8 w-8 rounded-full" />}
          <Skeleton
            className={cn("h-3 w-24", {
              "text-muted-foreground": isCompact,
            })}
          />
        </div>

        {!isCompact && (
          <div className="text-xs">
            <Skeleton className="h-3 w-48" />
          </div>
        )}
      </div>
      <div className="flex-shrink-0 self-start">
        <Skeleton className="h-6 w-6 rounded" />
      </div>
    </div>
  );
};
