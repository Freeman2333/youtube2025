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
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
    },
    onError: (error) => {
      if (error?.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });
  const dislikeMutation = trpc.videoReactions.dislike.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
    },
    onError: (error) => {
      if (error?.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
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
