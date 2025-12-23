import type { VideoWithUser } from "@/modules/videos/types";

import { VideoOwner } from "@/modules/videos/ui/components/video-owner";
import { Reactions } from "@/modules/videos/ui/components/reactions";
import { VideoMenu } from "@/modules/videos/ui/components/video-menu";
import { VideoDescription } from "@/modules/videos/ui/components/video-description";
import { Skeleton } from "@/components/ui/skeleton";

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

export const VideoTopRowSkeleton = () => {
  return (
    <div>
      <Skeleton className="h-7 w-3/4 mb-2" />
      <div className="flex justify-between flex-wrap items-center gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="pl-4">
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Skeleton className="h-9 w-16 rounded-l-full rounded-r-none" />
            <Skeleton className="h-6 w-px mx-0" />
            <Skeleton className="h-9 w-16 rounded-r-full rounded-l-none" />
          </div>
          <Skeleton className="size-9 rounded-full" />
        </div>
      </div>
      <div className="mt-5">
        <div className="bg-secondary/60 rounded-xl p-4">
          <div className="mb-2 flex gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="pt-2 mt-4">
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
};
