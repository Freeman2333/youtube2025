"use client";

import { Loader2 } from "lucide-react";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { ResponsiveModal } from "@/components/responsive-modal";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { PlaylistAddModalItem } from "@/modules/playlists/ui/components/playlist-add-modal-item";

interface PlaylistAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
}

export const PlaylistAddModal = ({
  open,
  onOpenChange,
  videoId,
}: PlaylistAddModalProps) => {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    trpc.playlists.getManyForVideo.useInfiniteQuery(
      { videoId, limit: DEFAULT_LIMIT },
      {
        enabled: open,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add to playlist"
    >
      <div className="flex flex-col gap-2 pt-4">
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading &&
          data?.pages
            .flatMap((page) => page.items)
            .map((playlist) => (
              <PlaylistAddModalItem
                key={playlist.id}
                playlistId={playlist.id}
                videoId={videoId}
                title={playlist.title}
                checked={Boolean(playlist.containsVideo)}
              />
            ))}
        {!isLoading && (
          <InfiniteScroll
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            isManual
          />
        )}
      </div>
    </ResponsiveModal>
  );
};
