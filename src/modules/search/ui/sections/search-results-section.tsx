"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";

import { trpc } from "@/trpc/client";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";

const SearchResultsSectionSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="hidden md:block space-y-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} variant="default" />
        ))}
      </div>

      <div className="md:hidden flex flex-col gap-y-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

interface SearchResultsSectionProps {
  query?: string;
  categoryId?: string;
}

export const SearchResultsSection = ({
  query,
  categoryId,
}: SearchResultsSectionProps) => {
  return (
    <Suspense fallback={<SearchResultsSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <SearchResultsSectionSuspense query={query} categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

interface SearchResultsSectionSuspenseProps {
  query?: string;
  categoryId?: string;
}

export const SearchResultsSectionSuspense = ({
  query,
  categoryId,
}: SearchResultsSectionSuspenseProps) => {
  const [data, searchQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
    { query, categoryId, limit: DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const searchResults = data.pages.flatMap((p) => p.items);

  return (
    <div className="space-y-6">
      <div className="hidden md:block  space-y-4">
        {searchResults.map((video) => (
          <VideoRowCard key={video.id} video={video} variant="default" />
        ))}
      </div>

      <div className="md:hidden flex flex-col gap-y-8">
        {searchResults.map((video) => (
          <VideoGridCard key={video.id} video={video} />
        ))}
      </div>

      <InfiniteScroll
        hasNextPage={searchQuery.hasNextPage}
        isFetchingNextPage={searchQuery.isFetchingNextPage}
        fetchNextPage={searchQuery.fetchNextPage}
      />

      {searchResults.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No videos found matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};
