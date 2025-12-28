import { ReactionType } from "@/db/schema";
import { DEFAULT_LIMIT } from "@/constants";
import type { Comment } from "@/modules/comments/types";
import { trpc } from "@/trpc/client";

type CommentReactionUpdate = {
  commentId: string;
  videoId: string;
  parentCommentId?: string;
  newReaction: ReactionType;
};

type QueryParams = {
  videoId?: string;
  parentId?: string;
  limit?: number;
};

type TRPCUtils = ReturnType<typeof trpc.useUtils>;
type TRPCInfiniteData = ReturnType<
  TRPCUtils["comments"]["getMany"]["getInfiniteData"]
>;

const updateCommentReaction = (
  comment: Comment,
  newReaction: ReactionType
): Comment => {
  let likes = comment.likesCount || 0;
  let dislikes = comment.dislikesCount || 0;
  const currentReaction = comment.viewerReaction;

  if (newReaction === ReactionType.LIKE) {
    if (currentReaction === ReactionType.LIKE) {
      likes = Math.max(0, likes - 1);
    } else if (currentReaction === ReactionType.DISLIKE) {
      dislikes = Math.max(0, dislikes - 1);
      likes += 1;
    } else {
      likes += 1;
    }
  } else if (newReaction === ReactionType.DISLIKE) {
    if (currentReaction === ReactionType.DISLIKE) {
      dislikes = Math.max(0, dislikes - 1);
    } else if (currentReaction === ReactionType.LIKE) {
      likes = Math.max(0, likes - 1);
      dislikes += 1;
    } else {
      dislikes += 1;
    }
  }

  const finalReaction = currentReaction === newReaction ? null : newReaction;

  return {
    ...comment,
    likesCount: likes,
    dislikesCount: dislikes,
    viewerReaction: finalReaction,
  };
};

const updateSingleQuery = async (
  utils: TRPCUtils,
  queryParams: QueryParams,
  commentId: string,
  newReaction: ReactionType
): Promise<TRPCInfiniteData> => {
  await utils.comments.getMany.cancel(queryParams);

  const previousData = utils.comments.getMany.getInfiniteData({
    ...queryParams,
    limit: DEFAULT_LIMIT,
  });

  utils.comments.getMany.setInfiniteData(
    { ...queryParams, limit: DEFAULT_LIMIT },
    (old) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: page.items.map((comment) => {
            if (comment.id !== commentId) return comment;
            return updateCommentReaction(comment, newReaction);
          }),
        })),
      };
    }
  );

  return previousData;
};

export const handleCommentReactionOptimisticUpdate = async (
  utils: TRPCUtils,
  { commentId, videoId, parentCommentId, newReaction }: CommentReactionUpdate
): Promise<{
  previousPages: TRPCInfiniteData;
  previousReplies: TRPCInfiniteData | null;
}> => {
  const previousPages = await updateSingleQuery(
    utils,
    { videoId },
    commentId,
    newReaction
  );

  let previousReplies: TRPCInfiniteData | null = null;
  if (parentCommentId) {
    previousReplies = await updateSingleQuery(
      utils,
      { parentId: parentCommentId },
      commentId,
      newReaction
    );
  }

  return { previousPages, previousReplies };
};
