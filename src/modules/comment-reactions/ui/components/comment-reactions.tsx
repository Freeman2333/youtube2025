"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";
import { ReactionType } from "@/db/schema";
import { DEFAULT_LIMIT } from "@/constants";

interface CommentReactionsProps {
  commentId: string;
  videoId: string;
  likesCount?: number;
  dislikesCount?: number;
  viewerReaction?: ReactionType | null;
}

export const CommentReactions = ({
  commentId,
  videoId,
  likesCount = 0,
  dislikesCount = 0,
  viewerReaction = null,
}: CommentReactionsProps) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const likeMutation = trpc.commentReactions.like.useMutation({
    onMutate: async () => {
      await utils.comments.getMany.cancel({ videoId });
      const previousPages = utils.comments.getMany.getInfiniteData({
        videoId,
        limit: DEFAULT_LIMIT,
      });

      utils.comments.getMany.setInfiniteData(
        { videoId, limit: DEFAULT_LIMIT },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((comment) => {
                if (comment.id !== commentId) return comment;

                let likes = comment.likesCount || 0;
                let dislikes = comment.dislikesCount || 0;
                const currentReaction = comment.viewerReaction;

                if (currentReaction === ReactionType.LIKE) {
                  likes = Math.max(0, likes - 1);
                } else if (currentReaction === ReactionType.DISLIKE) {
                  dislikes = Math.max(0, dislikes - 1);
                  likes += 1;
                } else {
                  likes += 1;
                }

                return {
                  ...comment,
                  likesCount: likes,
                  dislikesCount: dislikes,
                  viewerReaction:
                    currentReaction === ReactionType.LIKE
                      ? null
                      : ReactionType.LIKE,
                };
              }),
            })),
          };
        }
      );

      return { previousPages };
    },
    onError: (error, _vars, context) => {
      utils.comments.getMany.setInfiniteData(
        { videoId, limit: DEFAULT_LIMIT },
        context?.previousPages
      );
      if (error?.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
    onSettled: () => {
      utils.comments.getMany.invalidate({ videoId });
    },
  });

  const dislikeMutation = trpc.commentReactions.dislike.useMutation({
    onMutate: async () => {
      await utils.comments.getMany.cancel({ videoId });

      const previousPages = utils.comments.getMany.getInfiniteData({
        videoId,
        limit: DEFAULT_LIMIT,
      });

      utils.comments.getMany.setInfiniteData(
        { videoId, limit: DEFAULT_LIMIT },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((comment) => {
                if (comment.id !== commentId) return comment;

                let likes = comment.likesCount || 0;
                let dislikes = comment.dislikesCount || 0;
                const currentReaction = comment.viewerReaction;

                if (currentReaction === ReactionType.DISLIKE) {
                  dislikes = Math.max(0, dislikes - 1);
                } else if (currentReaction === ReactionType.LIKE) {
                  likes = Math.max(0, likes - 1);
                  dislikes += 1;
                } else {
                  dislikes += 1;
                }

                return {
                  ...comment,
                  likesCount: likes,
                  dislikesCount: dislikes,
                  viewerReaction:
                    currentReaction === ReactionType.DISLIKE
                      ? null
                      : ReactionType.DISLIKE,
                };
              }),
            })),
          };
        }
      );

      return { previousPages };
    },
    onError: (error, _vars, context) => {
      utils.comments.getMany.setInfiniteData(
        { videoId },
        context?.previousPages
      );
      if (error?.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
    onSettled: () => {
      utils.comments.getMany.invalidate({ videoId });
    },
  });

  return (
    <div className="flex items-center gap-2 mt-2">
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
