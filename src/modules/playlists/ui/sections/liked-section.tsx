"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

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

const LikedSectionSkeleton = () => {
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

const LikedSectionSuspense = () => {
  const [data, query] = trpc.playlists.getLiked.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const items = data.pages.flatMap((p) => p.items);

  return (
    <div className="space-y-6">
      <div className="hidden md:block space-y-4">
        {items.map((video) => (
          <VideoRowCard key={video.id} video={video} variant="compact" />
        ))}
      </div>

      <div className="md:hidden flex flex-col gap-y-8">
        {items.map((video) => (
          <VideoGridCard key={video.id} video={video} />
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

export const LikedSection = () => {
  return (
    <Suspense fallback={<LikedSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <LikedSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};
