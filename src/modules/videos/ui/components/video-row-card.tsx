"use client";

import Link from "next/link";
import { useMemo } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { UserAvatar } from "@/components/user-avatar";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import Thumbnail from "@/modules/videos/ui/components/video-thumbnail";
import { VideoMenu } from "@/modules/videos/ui/components/video-menu";

import { cn } from "@/lib/utils";

import type { SuggestionVideo } from "@/modules/suggestions/types";

const videoRowCardVariants = cva("flex rounded-lg transition-colors mb-4", {
  variants: {
    variant: {
      default: "gap-3",
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
      <Link href={`/videos/${video.id}`}>
        <Thumbnail
          duration={video.duration}
          imageUrl={video.thumbnailUrl}
          previewUrl={video.previewUrl}
          title={video.title}
          className={cn({
            "w-[168px]": isCompact,
            "w-[178px]": !isCompact,
          })}
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/videos/${video.id}`}>
          <h3
            className={cn("font-medium line-clamp-2 text-gray-900 mb-1", {
              "text-sm": isCompact,
              "text-md": !isCompact,
            })}
          >
            {video.title}
          </h3>
        </Link>
        <div
          className={cn("flex items-center gap-2 mb-1", {
            "mb-0.5": isCompact,
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
              size={isCompact ? "sm" : "default"}
              className={cn({
                "text-muted-foreground": isCompact,
              })}
            />
          </Link>
        </div>

        <Link href={`/videos/${video.id}`}>
          <div
            className={cn("text-muted-foreground", {
              "text-xs": isCompact,
              "text-sm": !isCompact,
            })}
          >
            <span>{compactViews} views</span>
            <span className="mx-1">•</span>
            <span>{compactLikes} likes</span>
          </div>
        </Link>
      </div>
      <div className="flex-shrink-0 self-start">
        <VideoMenu videoId={video.id} />
      </div>
    </div>
  );
};
