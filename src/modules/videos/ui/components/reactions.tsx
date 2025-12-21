import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";
import { ReactionType } from "@/db/schema";
import { VideoWithUser } from "@/modules/videos/types";

interface ReactionsProps {
  videoId: string;
  likesCount: VideoWithUser["likesCount"];
  dislikesCount: VideoWithUser["dislikesCount"];
  viewerReaction: VideoWithUser["viewerReaction"];
}

export const Reactions = ({
  videoId,
  likesCount = 0,
  dislikesCount = 0,
  viewerReaction = null,
}: ReactionsProps) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const likeMutation = trpc.videoReactions.like.useMutation({
    onMutate: async () => {
      await utils.videos.getOne.cancel({ id: videoId });
      const previous = utils.videos.getOne.getData({ id: videoId });
      utils.videos.getOne.setData({ id: videoId }, (old) => {
        if (!old) return old;

        let likes = old.likesCount || 0;
        let dislikes = old.dislikesCount || 0;
        const viewerReaction = old.viewerReaction;

        if (viewerReaction === ReactionType.LIKE) {
          likes = Math.max(0, likes - 1);
        } else if (viewerReaction === ReactionType.DISLIKE) {
          dislikes = Math.max(0, dislikes - 1);
          likes += 1;
        } else {
          likes += 1;
        }

        return {
          ...old,
          likesCount: likes,
          dislikesCount: dislikes,
          viewerReaction:
            viewerReaction === ReactionType.LIKE ? null : ReactionType.LIKE,
        };
      });
      return { previous };
    },
    onError: (error, _vars, context) => {
      utils.videos.getOne.setData({ id: videoId }, context?.previous);
      if (error?.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
    onSettled: () => {
      utils.videos.getOne.invalidate({ id: videoId });
    },
  });
  const dislikeMutation = trpc.videoReactions.dislike.useMutation({
    onMutate: async () => {
      await utils.videos.getOne.cancel({ id: videoId });
      const previous = utils.videos.getOne.getData({ id: videoId });
      utils.videos.getOne.setData({ id: videoId }, (old) => {
        if (!old) return old;
        let likes = old.likesCount ?? 0;
        let dislikes = old.dislikesCount ?? 0;
        const viewer = old.viewerReaction ?? null;
        if (viewer === ReactionType.DISLIKE) {
          dislikes = Math.max(0, dislikes - 1);
        } else if (viewer === ReactionType.LIKE) {
          likes = Math.max(0, likes - 1);
          dislikes = dislikes + 1;
        } else {
          dislikes = dislikes + 1;
        }
        return {
          ...old,
          likesCount: likes,
          dislikesCount: dislikes,
          viewerReaction:
            viewer === ReactionType.DISLIKE ? null : ReactionType.DISLIKE,
        };
      });
      return { previous };
    },
    onError: (error, _vars, context) => {
      utils.videos.getOne.setData({ id: videoId }, context?.previous);
      if (error?.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
    onSettled: () => {
      utils.videos.getOne.invalidate({ id: videoId });
    },
  });

  return (
    <div className="flex items-center">
      <Button
        type="button"
        variant="secondary"
        onClick={() => likeMutation.mutate({ videoId })}
        className="rounded-l-full rounded-r-none flex items-center gap-1 border-0 transition-colors"
        aria-label="Like"
      >
        <ThumbsUp
          className={cn(
            "size-4 transition-all text-primary",
            viewerReaction === ReactionType.LIKE && " fill-primary"
          )}
        />

        <span className="text-sm ml-1">{likesCount}</span>
      </Button>
      <Separator orientation="vertical" className="h-6 mx-0 p-0" />
      <Button
        type="button"
        variant="secondary"
        onClick={() => dislikeMutation.mutate({ videoId })}
        className="rounded-r-full rounded-l-none flex items-center gap-1 border-0 transition-colors"
        aria-label="Dislike"
      >
        <ThumbsDown
          className={cn(
            "size-4 transition-all text-primary",
            viewerReaction === ReactionType.DISLIKE && " fill-primary"
          )}
        />
        <span className="text-sm ml-1">{dislikesCount}</span>
      </Button>
    </div>
  );
};
