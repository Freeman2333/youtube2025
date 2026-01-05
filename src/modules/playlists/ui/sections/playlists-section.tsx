"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { InfiniteScroll } from "@/components/infinite-scroll";
import PlaylistGridCard, {
  PlaylistGridCardSkeleton,
} from "@/modules/playlists/ui/components/playlist-grid-card";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";

const PlaylistsSectionSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5">
      {Array.from({ length: 8 }).map((_, index) => (
        <PlaylistGridCardSkeleton key={index} />
      ))}
    </div>
  );
};

const PlaylistsSectionSuspense = () => {
  const [data, query] = trpc.playlists.getMany.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const items = data.pages.flatMap((p) => p.items);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5">
        {items.map((playlist) => {
          return (
            <PlaylistGridCard
              key={playlist.id}
              id={playlist.id}
              title={playlist.title}
              videoCount={playlist.videosCount ?? 0}
            />
          );
        })}
      </div>

      <InfiniteScroll
        fetchNextPage={query.fetchNextPage}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
      />
    </div>
  );
};

export const PlaylistsSection = () => {
  return (
    <Suspense fallback={<PlaylistsSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <PlaylistsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

export default PlaylistsSection;
