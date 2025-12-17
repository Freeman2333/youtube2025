import MuxPlayer from "@mux/mux-player-react";
import Thumbnail from "./video-thumbnail";

interface VideoPlayerProps {
  autoPlay?: boolean;
  duration: number | null;
  onPlay?: () => void;
  playbackId?: string | null;
  thumbnailUrl?: string | null;
  previewUrl?: string | null;
  title: string;
}

export const VideoPlayer = ({
  autoPlay,
  duration,
  onPlay,
  playbackId,
  thumbnailUrl,
  previewUrl,
  title,
}: VideoPlayerProps) => {
  if (!playbackId) {
    return (
      <Thumbnail
        className="rounded-b-none w-full"
        duration={duration}
        title={title}
        imageUrl={thumbnailUrl || "/placeholder.svg"}
        previewUrl={previewUrl}
      />
    );
  }

  return (
    <MuxPlayer
      playbackId={playbackId}
      poster={thumbnailUrl || "/placeholder.svg"}
      playerInitTime={0}
      autoPlay={autoPlay}
      thumbnailTime={0}
      className="size-full object-contain"
      accentColor="#ff2056"
      onPlay={onPlay}
    />
  );
};
