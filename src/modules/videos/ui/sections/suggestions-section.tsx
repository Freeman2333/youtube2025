"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { Skeleton } from "@/components/ui/skeleton";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { VideoRowCard } from "@/modules/videos/ui/components/video-row-card";
import { VideoGridCard } from "@/modules/videos/ui/components/video-grid-card";

const SuggestionsSectionSkeleton = () => {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-32" />
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="aspect-video w-40 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
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
      <div className="lg:hidden flex flex-col gap-y-4">
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
