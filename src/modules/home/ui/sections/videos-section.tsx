"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { InfiniteScroll } from "@/components/infinite-scroll";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";

const VideosSectionSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <VideoGridCardSkeleton key={index} />
      ))}
    </div>
  );
};

interface VideosSectionProps {
  categoryId?: string;
}

export const VideosSection = ({ categoryId }: VideosSectionProps) => {
  return (
    <Suspense fallback={<VideosSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <VideosSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

interface VideosSectionSuspenseProps {
  categoryId?: string;
}

export const VideosSectionSuspense = ({
  categoryId,
}: VideosSectionSuspenseProps) => {
  const [data, query] = trpc.videos.getMany.useSuspenseInfiniteQuery(
    { categoryId, limit: DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const videos = data.pages.flatMap((p) => p.items);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5  gap-6">
        {videos.map((video) => (
          <VideoGridCard key={video.id} video={video} />
        ))}
      </div>

      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />

      {videos.length === 0 && (
        <div className="flex flex-col justify-center items-center text-center min-h-[calc(100vh-350px)]">
          <p className="text-muted-foreground text-sm">No videos available.</p>
        </div>
      )}
    </>
  );
};
