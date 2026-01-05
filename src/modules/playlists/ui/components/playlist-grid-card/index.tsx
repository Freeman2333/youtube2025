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
  imageUrl?: string;
}

const PlaylistGridCard = ({
  id,
  title,
  videoCount = 0,
  imageUrl,
}: PlaylistGridCardProps) => {
  return (
    <Link href={`/playlist/${id}`} className="block group">
      <div className="rounded-md overflow-hidden">
        <PlaylistThumbnail imageUrl={imageUrl} videoCount={videoCount} />
      </div>

      <PlaylistInfo title={title} />
    </Link>
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
