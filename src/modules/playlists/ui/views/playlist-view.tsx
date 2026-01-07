"use client";

import { PlaylistHeader } from "@/modules/playlists/ui/components/playlist-header";
import { PlaylistSection } from "../sections/playlist-section";

interface PlaylistViewProps {
  playlistId: string;
}

export const PlaylistView = ({ playlistId }: PlaylistViewProps) => {
  return (
    <div className="max-w-[800px] mx-auto p-4">
      <PlaylistHeader playlistId={playlistId} />
      <PlaylistSection playlistId={playlistId} />
    </div>
  );
};
