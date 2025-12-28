"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";
import { ReactionType } from "@/db/schema";
import { DEFAULT_LIMIT } from "@/constants";
import { handleCommentReactionOptimisticUpdate } from "@/modules/comment-reactions/lib/optimistic-updates";

interface CommentReactionsProps {
  commentId: string;
  videoId: string;
  likesCount?: number;
  dislikesCount?: number;
  viewerReaction?: ReactionType | null;
  parentCommentId?: string;
}

export const CommentReactions = ({
  commentId,
  videoId,
  likesCount = 0,
  dislikesCount = 0,
  viewerReaction = null,
  parentCommentId,
}: CommentReactionsProps) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const likeMutation = trpc.commentReactions.like.useMutation({
    onMutate: async () => {
      return await handleCommentReactionOptimisticUpdate(utils, {
        commentId,
        videoId,
        parentCommentId,
        newReaction: ReactionType.LIKE,
      });
    },
    onError: (error, _vars, context) => {
      utils.comments.getMany.setInfiniteData(
        { videoId, limit: DEFAULT_LIMIT },
        context?.previousPages
      );
      if (parentCommentId && context?.previousReplies) {
        utils.comments.getMany.setInfiniteData(
          { parentId: parentCommentId, limit: DEFAULT_LIMIT },
          context.previousReplies
        );
      }
      if (error?.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
    onSettled: () => {
      utils.comments.getMany.invalidate({ videoId });
      if (parentCommentId) {
        utils.comments.getMany.invalidate({ parentId: parentCommentId });
      }
    },
  });

  const dislikeMutation = trpc.commentReactions.dislike.useMutation({
    onMutate: async () => {
      return await handleCommentReactionOptimisticUpdate(utils, {
        commentId,
        videoId,
        parentCommentId,
        newReaction: ReactionType.DISLIKE,
      });
    },
    onError: (error, _vars, context) => {
      utils.comments.getMany.setInfiniteData(
        { videoId, limit: DEFAULT_LIMIT },
        context?.previousPages
      );
      if (parentCommentId && context?.previousReplies) {
        utils.comments.getMany.setInfiniteData(
          { parentId: parentCommentId, limit: DEFAULT_LIMIT },
          context.previousReplies
        );
      }
      if (error?.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
    onSettled: () => {
      utils.comments.getMany.invalidate({ videoId });
      if (parentCommentId) {
        utils.comments.getMany.invalidate({ parentId: parentCommentId });
      }
    },
  });

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => likeMutation.mutate({ commentId })}
          className="hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Like comment"
        >
          <ThumbsUp
            className={cn(
              "size-4 transition-all text-gray-600 hover:text-primary",
              viewerReaction === ReactionType.LIKE &&
                "fill-primary text-primary"
            )}
          />
        </Button>
        <span
          className={cn(
            "text-xs text-muted-foreground min-w-[1ch]",
            likesCount === 0 && "opacity-0"
          )}
        >
          {likesCount}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => dislikeMutation.mutate({ commentId })}
          className="hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Dislike comment"
        >
          <ThumbsDown
            className={cn(
              "size-4 transition-all text-gray-600 hover:text-primary",
              viewerReaction === ReactionType.DISLIKE &&
                "fill-primary text-primary"
            )}
          />
        </Button>
        <span
          className={cn(
            "text-xs text-muted-foreground min-w-[1ch]",
            dislikesCount === 0 && "opacity-0"
          )}
        >
          {dislikesCount}
        </span>
      </div>
    </div>
  );
};
