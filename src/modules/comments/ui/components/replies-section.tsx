"use client";

import { Suspense } from "react";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { Spinner } from "@/components/ui/spinner";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";

import { CommentItem } from "@/modules/comments/ui/components/comment-item";

interface RepliesSectionProps {
  commentId: string;
  videoId: string;
}

const RepliesLoadingFallback = () => (
  <div className="flex items-center gap-2 py-4 justify-center">
    <Spinner className="size-6" />
  </div>
);

const RepliesList = ({
  commentId,
  videoId,
}: {
  commentId: string;
  videoId: string;
}) => {
  const [data, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
    { parentId: commentId, limit: DEFAULT_LIMIT },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const replies = data.pages.flatMap((p) => p.items);

  return (
    <>
      {replies.map((reply) => (
        <CommentItem key={reply.id} comment={reply} videoId={videoId} />
      ))}

      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};

export const RepliesSection = ({ commentId, videoId }: RepliesSectionProps) => {
  return (
    <div className="mt-3 ml-8">
      <Suspense fallback={<RepliesLoadingFallback />}>
        <RepliesList commentId={commentId} videoId={videoId} />
      </Suspense>
    </div>
  );
};
