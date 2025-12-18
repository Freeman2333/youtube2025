"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import { VideoBanner } from "@/modules/videos/ui/components/video-banner";
import { VideoTopRow } from "@/modules/videos/ui/components/video-top-row";
import { trpc } from "@/trpc/client";
import type { MuxStatus } from "@/db/schema";

const VideosSectionSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="flex gap-4 items-start">
          <Skeleton className="w-56 aspect-video rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

interface VideoSectionProps {
  videoId: string;
}

export const VideoSection = ({ videoId }: VideoSectionProps) => {
  return (
    <Suspense fallback={<VideosSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

interface VideosSectionProps {
  videoId: string;
}

export const VideoSectionSuspense = ({ videoId }: VideosSectionProps) => {
  const [data] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });

  const video = data?.video;
  const user = data?.user;

  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
          <VideoPlayer
            playbackId={video.muxPlaybackId}
            duration={video.duration}
            thumbnailUrl={video.thumbnailUrl}
            previewUrl={video.previewUrl}
            title={video.title}
          />
        </div>
      </div>
      <div>
        <VideoBanner muxStatus={video.muxStatus as MuxStatus} />
      </div>
      <div>
        <VideoTopRow video={video} user={user} />
      </div>
    </div>
  );
};
