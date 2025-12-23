"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useUser } from "@clerk/nextjs";

import {
  VideoPlayer,
  VideoPlayerSkeleton,
} from "@/modules/videos/ui/components/video-player";
import { VideoBanner } from "@/modules/videos/ui/components/video-banner";
import {
  VideoTopRow,
  VideoTopRowSkeleton,
} from "@/modules/videos/ui/components/video-top-row";
import { trpc } from "@/trpc/client";
import type { MuxStatus } from "@/db/schema";

const VideosSectionSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <VideoPlayerSkeleton />
      <VideoTopRowSkeleton />
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
  const { isSignedIn } = useUser();

  const utils = trpc.useUtils();
  const [data] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });

  const createVideoView = trpc.videoViews.create.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
    },
  });

  const video = data?.video;

  const handlePlay = () => {
    if (isSignedIn) {
      createVideoView.mutate({ videoId });
    }
  };

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
            onPlay={handlePlay}
          />
        </div>
      </div>
      <div>
        <VideoBanner muxStatus={video.muxStatus as MuxStatus} />
      </div>
      <div>
        <VideoTopRow data={data} />
      </div>
    </div>
  );
};
