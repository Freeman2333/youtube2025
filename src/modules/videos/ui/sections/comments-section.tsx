"use client";

import { trpc } from "@/trpc/client";
import { CommentForm } from "@/modules/comments/ui/components/comment-form";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const CommentsSectionSkeleton = () => {
  return <div>Loading comments...</div>;
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
  const [data] = trpc.comments.getMany.useSuspenseQuery({ videoId });
  console.log({ data });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        {data.length} Comment{data.length !== 1 ? "s" : ""}
      </h2>

      <CommentForm videoId={videoId} />

      <div className="space-y-4">
        {data.map((comment) => (
          <div key={comment.id} className="border p-4 rounded">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(comment, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
