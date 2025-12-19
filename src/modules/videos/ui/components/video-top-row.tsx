import React from "react";
import { VideoOwner } from "./video-owner";
import { Reactions } from "./reactions";
import { VideoMenu } from "./video-menu";
import { VideoDescription } from "./video-description";
import type { VideoWithUser } from "@/modules/videos/types";

interface VideoTopRowProps {
  video: VideoWithUser["video"];
  user: VideoWithUser["user"];
  viewCount: VideoWithUser["viewCount"];
}

export const VideoTopRow = ({ video, user, viewCount }: VideoTopRowProps) => {
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
        />
        <div className="flex items-center gap-4">
          <Reactions value="like" />
          <VideoMenu videoId={video.id} />
        </div>
      </div>
      <div className="mt-5">
        <VideoDescription video={video} viewCount={viewCount} />
      </div>
    </div>
  );
};
