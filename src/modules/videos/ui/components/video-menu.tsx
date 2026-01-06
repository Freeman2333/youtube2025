"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Share2, PlusSquare, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { APP_URL } from "@/constants";
import { PlaylistAddModal } from "@/modules/playlists/ui/components/playlist-add-modal";

interface VideoMenuProps {
  videoId: string;
  variant?: "ghost" | "secondary";
}

export const VideoMenu = ({ videoId, variant = "ghost" }: VideoMenuProps) => {
  const fullUrl = `${APP_URL}/videos/${videoId}`;

  const [openPlaylistModal, setOpenPlaylistModal] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    toast.success("Video URL copied to clipboard!");
  };

  return (
    <>
      <PlaylistAddModal
        open={openPlaylistModal}
        onOpenChange={setOpenPlaylistModal}
        videoId={videoId}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size="icon"
            className="rounded-full"
            aria-label="Open menu"
          >
            <MoreVertical className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleCopy}>
            <Share2 className="size-4 mr-2 text-muted-foreground" />
            <span>Share</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenPlaylistModal(true)}>
            <PlusSquare className="size-4 mr-2 text-muted-foreground" />
            <span>Add to playlist</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
