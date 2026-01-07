"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import toast from "react-hot-toast";

import { InfiniteScroll } from "@/components/infinite-scroll";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";

interface PlaylistSectionProps {
  playlistId: string;
}

const PlaylistSectionSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="hidden md:block max-w-[880px] mx-auto space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <VideoRowCardSkeleton key={i} variant="compact" />
        ))}
      </div>

      <div className="md:hidden flex flex-col gap-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <VideoGridCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

const PlaylistSectionSuspense = ({ playlistId }: PlaylistSectionProps) => {
  const utils = trpc.useUtils();

  const [data, query] = trpc.playlists.getVideos.useSuspenseInfiniteQuery(
    { playlistId, limit: DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const removeVideo = trpc.playlists.removeFromPlaylist.useMutation({
    onSuccess: () => {
      toast.success("Video removed from playlist");
      utils.playlists.getVideos.invalidate({ playlistId });
    },
    onError: () => {
      toast.error("Failed to remove video from playlist");
    },
  });

  const items = data.pages.flatMap((p) => p.items);

  return (
    <div className="space-y-6">
      <div className="hidden md:block space-y-4">
        {items.map((video) => (
          <VideoRowCard
            key={video.id}
            video={video}
            variant="compact"
            onRemove={() =>
              removeVideo.mutate({ playlistId, videoId: video.id })
            }
          />
        ))}
      </div>

      <div className="md:hidden flex flex-col gap-y-8">
        {items.map((video) => (
          <VideoGridCard
            key={video.id}
            video={video}
            onRemove={() =>
              removeVideo.mutate({ playlistId, videoId: video.id })
            }
          />
        ))}
      </div>

      <InfiniteScroll
        fetchNextPage={query.fetchNextPage}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
      />
    </div>
  );
};

export const PlaylistSection = ({ playlistId }: PlaylistSectionProps) => {
  return (
    <Suspense fallback={<PlaylistSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <PlaylistSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};
