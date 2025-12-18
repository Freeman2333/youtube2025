import toast from "react-hot-toast";
import { MoreHorizontal, Share2, PlusSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export const VideoMenu = ({ videoId }: { videoId: string }) => {
  const fullUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/videos/${videoId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    toast.success("Video URL copied to clipboard!");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus:ring-primary"
          aria-label="Open menu"
        >
          <MoreHorizontal className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopy}>
          <Share2 className="size-4 mr-2 text-muted-foreground" />
          <span>Share</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <PlusSquare className="size-4 mr-2 text-muted-foreground" />
          <span>Add to playlist</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
