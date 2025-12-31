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

const SuggestionsSectionSkeleton = () => {
  return (
    <div className="space-y-3">
      <div className="lg:hidden flex flex-col gap-y-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>

      <div className="hidden lg:block space-y-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} variant="compact" />
        ))}
      </div>
    </div>
  );
};

interface SuggestionsSectionProps {
  videoId: string;
}

export const SuggestionsSection = ({ videoId }: SuggestionsSectionProps) => {
  return (
    <Suspense fallback={<SuggestionsSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <SuggestionsSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

interface SuggestionsSectionSuspenseProps {
  videoId: string;
}

export const SuggestionsSectionSuspense = ({
  videoId,
}: SuggestionsSectionSuspenseProps) => {
  const [data, query] = trpc.suggestions.getMany.useSuspenseInfiniteQuery(
    { videoId, limit: DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const suggestions = data.pages.flatMap((p) => p.items);

  return (
    <>
      <div className="lg:hidden flex flex-col gap-y-8">
        {suggestions.map((suggestion) => (
          <VideoGridCard key={suggestion.id} video={suggestion} />
        ))}
      </div>

      <div className="hidden lg:block">
        {suggestions.map((suggestion) => (
          <VideoRowCard
            key={suggestion.id}
            video={suggestion}
            variant={"compact"}
          />
        ))}
      </div>

      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};
