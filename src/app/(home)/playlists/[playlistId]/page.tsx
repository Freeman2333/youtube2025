import { HydrateClient, trpc } from "@/trpc/server";

import { DEFAULT_LIMIT } from "@/constants";
import { PlaylistView } from "@/modules/playlists/ui/views/playlist-view";

export const dynamic = "force-dynamic";

interface PlaylistPageProps {
  params: Promise<{ playlistId: string }>;
}

const PlaylistPage = async ({ params }: PlaylistPageProps) => {
  const { playlistId } = await params;

  void trpc.playlists.getOne.prefetch({ id: playlistId });
  void trpc.playlists.getVideos.prefetchInfinite({
    playlistId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <PlaylistView playlistId={playlistId} />
    </HydrateClient>
  );
};

export default PlaylistPage;
