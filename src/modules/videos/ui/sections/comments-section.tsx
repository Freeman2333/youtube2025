"use client";

import { trpc } from "@/trpc/client";
import { CommentForm } from "@/modules/comments/ui/components/comment-form";
import { CommentItem } from "@/modules/comments/ui/components/comment-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";

const CommentsSectionSkeleton = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-32" />
      <div className="flex gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex gap-3">
            <Skeleton className="size-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface CommentsSectionProps {
  videoId: string;
}

export const CommentsSection = ({ videoId }: CommentsSectionProps) => {
  return (
    <Suspense fallback={<CommentsSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <CommentsSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

interface CommentsSectionSuspenseProps {
  videoId: string;
}

export const CommentsSectionSuspense = ({
  videoId,
}: CommentsSectionSuspenseProps) => {
  const [data, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
    { videoId, limit: DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const comments = data.pages.flatMap((p) => p.items);
  const totalCount = data.pages[0]?.totalCount ?? 0;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        {totalCount} Comment{totalCount !== 1 ? "s" : ""}
      </h2>

      <CommentForm videoId={videoId} />

      <div>
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} videoId={videoId} />
        ))}
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
};
