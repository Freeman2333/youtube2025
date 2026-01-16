import Link from "next/link";

import {
  PlaylistThumbnail,
  PlaylistThumbnailSkeleton,
} from "@/modules/playlists/ui/components/playlist-grid-card/playlist-thumbnail";
import {
  PlaylistInfo,
  PlaylistInfoSkeleton,
} from "@/modules/playlists/ui/components/playlist-grid-card/playlist-info";

interface PlaylistGridCardProps {
  id: string;
  title: string;
  videoCount?: number;
  imageUrl: string | null;
}

const PlaylistGridCard = ({
  id,
  title,
  videoCount = 0,
  imageUrl,
}: PlaylistGridCardProps) => {
  return (
    <div className="group">
      <Link href={`/playlists/${id}`} prefetch>
        <div className="rounded-md overflow-hidden">
          <PlaylistThumbnail imageUrl={imageUrl} videoCount={videoCount} />
        </div>
      </Link>

      <PlaylistInfo playlistId={id} title={title} />
    </div>
  );
};

export const PlaylistGridCardSkeleton = () => {
  return (
    <div>
      <div className="rounded-md overflow-hidden">
        <PlaylistThumbnailSkeleton />
      </div>

      <PlaylistInfoSkeleton />
    </div>
  );
};

export default PlaylistGridCard;
