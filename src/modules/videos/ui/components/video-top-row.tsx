import type { VideoWithUser } from "@/modules/videos/types";

import { VideoOwner } from "@/modules/videos/ui/components/video-owner";
import { Reactions } from "@/modules/videos/ui/components/reactions";
import { VideoMenu } from "@/modules/videos/ui/components/video-menu";
import { VideoDescription } from "@/modules/videos/ui/components/video-description";

interface VideoTopRowProps {
  data: VideoWithUser;
}

export const VideoTopRow = ({ data }: VideoTopRowProps) => {
  const {
    video,
    user,
    viewCount,
    likesCount,
    dislikesCount,
    subscriberCount,
    isSubscribed,
  } = data;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">{video.title}</h2>
      <div className="flex justify-between flex-wrap items-center gap-4">
        <VideoOwner
          name={user.name}
          userId={user.id}
          userImage={user.imageUrl}
          userClerkId={user.clerkId}
          videoId={video.id}
          isSubscribed={isSubscribed}
          subscriberCount={subscriberCount}
        />
        <div className="flex items-center gap-4">
          <Reactions
            videoId={video.id}
            likesCount={likesCount}
            dislikesCount={dislikesCount}
            viewerReaction={data.viewerReaction}
          />
          <VideoMenu videoId={video.id} />
        </div>
      </div>
      <div className="mt-5">
        <VideoDescription video={video} viewCount={viewCount} />
      </div>
    </div>
  );
};
