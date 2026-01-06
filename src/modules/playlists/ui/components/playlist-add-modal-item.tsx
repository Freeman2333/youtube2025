"use client";

import { Loader2, Square, SquareCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

import { trpc } from "@/trpc/client";

interface PlaylistAddModalItemProps {
  playlistId: string;
  videoId: string;
  title: string;
  checked: boolean;
}

export const PlaylistAddModalItem = ({
  playlistId,
  videoId,
  title,
  checked,
}: PlaylistAddModalItemProps) => {
  const utils = trpc.useUtils();

  const addMutation = trpc.playlists.addToPlaylist.useMutation({
    onSuccess: () => {
      utils.playlists.getManyForVideo.invalidate({ videoId });
    },
  });

  const removeMutation = trpc.playlists.removeFromPlaylist.useMutation({
    onSuccess: () => {
      utils.playlists.getManyForVideo.invalidate({ videoId });
    },
  });

  const isPending = addMutation.isPending || removeMutation.isPending;

  const handleToggle = () => {
    if (checked) {
      removeMutation.mutate({ playlistId, videoId });
    } else {
      addMutation.mutate({ playlistId, videoId });
    }
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-4 py-4 px-3"
      disabled={isPending}
      onClick={handleToggle}
    >
      {isPending ? (
        <Loader2 className="!size-5 animate-spin" />
      ) : checked ? (
        <SquareCheck className="!size-5" />
      ) : (
        <Square className="!size-5" />
      )}
      <span className="text-sm font-medium">{title}</span>
    </Button>
  );
};
