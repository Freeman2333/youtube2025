"use client";

import { useState } from "react";
import { Loader2, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { ResponsiveModal } from "@/components/responsive-modal";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { PlaylistAddModalItem } from "@/modules/playlists/ui/components/playlist-add-modal-item";
import { CreatePlaylistModal } from "@/modules/playlists/ui/components/create-playlist-modal";

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
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    trpc.playlists.getManyForVideo.useInfiniteQuery(
      { videoId, limit: DEFAULT_LIMIT },
      {
        enabled: open,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  return (
    <>
      <CreatePlaylistModal
        open={createPlaylistOpen}
        onOpenChange={setCreatePlaylistOpen}
      />
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
          <Separator className="mb-2" />
          <Button
            variant="secondary"
            className="w-full justify-center rounded-full bg-[#e8e8e8] hover:bg-neutral-300"
            onClick={() => setCreatePlaylistOpen(true)}
          >
            <PlusIcon className="mr-2 size-4" />
            New playlist
          </Button>
        </div>
      </ResponsiveModal>
    </>
  );
};
