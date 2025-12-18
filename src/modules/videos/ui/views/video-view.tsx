import { VideoSection } from "@/modules/videos/ui/sections/video-section";

interface VideoViewProps {
  videoId: string;
}

export const VideoView = ({ videoId }: VideoViewProps) => {
  return (
    <div className="max-w-[1700px] px-4 pt-2.5 mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <VideoSection videoId={videoId} />
        </div>

        <div className="lg:col-span-4">
          <div className="h-full rounded-lg border border-dashed border-muted p-4">
            <p className="text-sm text-muted-foreground">
              Related lists / playlists (coming soon)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
