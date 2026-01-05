"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import CreatePlaylistModal from "@/modules/playlists/ui/components/create-playlist-modal";
import PlaylistsSection from "@/modules/playlists/ui/sections/playlists-section";

export const PlaylistsView = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-[2400px] mx-auto p-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Playlists</h1>
          <p className="text-muted-foreground">Collections you have created</p>
        </div>

        <Button
          variant="outline"
          className="size-9 p-0 rounded-full"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <PlaylistsSection />

      <CreatePlaylistModal open={open} onOpenChange={setOpen} />
    </div>
  );
};

export default PlaylistsView;
