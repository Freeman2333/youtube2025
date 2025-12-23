import { VideoSection } from "@/modules/videos/ui/sections/video-section";
import { CommentsSection } from "../sections/comments-section";
import { SuggestionsSection } from "../sections/suggestions-section";

interface VideoViewProps {
  videoId: string;
}

export const VideoView = ({ videoId }: VideoViewProps) => {
  return (
    <div className="max-w-[1700px] px-4 pt-2.5 mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 gap-y-8 flex flex-col">
          <VideoSection videoId={videoId} />
          <CommentsSection videoId={videoId} />
        </div>

        <div className="lg:col-span-4">
          <SuggestionsSection />
        </div>
      </div>
    </div>
  );
};
