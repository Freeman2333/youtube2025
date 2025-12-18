import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoWithUser } from "../../types";
import { format, formatDistanceToNow } from "date-fns";

interface VideoDescriptionProps {
  video: VideoWithUser["video"];
}

export const VideoDescription = ({ video }: VideoDescriptionProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandArea = () => {
    if (!expanded) {
      setExpanded(true);
    }
  };

  return (
    <div
      className={cn(
        "bg-secondary/60 rounded-xl p-4 transition-all flex flex-col gap-2 cursor-default",
        expanded ? "max-h-none" : "max-h-[150px] cursor-pointer"
      )}
      onClick={!expanded ? handleExpandArea : undefined}
    >
      <div className="mb-2 flex gap-4 text-sm font-medium">
        <span>123,456 views</span>
        <span>
          {expanded
            ? format(new Date(video?.createdAt), "d MMM yyyy")
            : `${formatDistanceToNow(new Date(video?.createdAt))} ago`}
        </span>
      </div>
      <div
        className={cn(
          "text-sm flex-1 overflow-hidden",
          !expanded && "line-clamp-6 truncate"
        )}
      >
        {video.description}
        {!video.description && (
          <span className="text-muted-foreground italic">No description.</span>
        )}
      </div>
      <div className="pt-2 mt-auto">
        <Button
          variant="ghost"
          className="flex items-center gap-1 px-2 py-1"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="size-4 ml-1" />
            </>
          ) : (
            <>
              Show more <ChevronDown className="size-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
