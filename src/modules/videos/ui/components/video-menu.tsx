import toast from "react-hot-toast";
import { Share2, PlusSquare, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface VideoMenuProps {
  videoId: string;
  variant?: "ghost" | "secondary";
}

export const VideoMenu = ({ videoId, variant = "ghost" }: VideoMenuProps) => {
  const fullUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/videos/${videoId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    toast.success("Video URL copied to clipboard!");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="icon"
          className="rounded-full outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus:ring-primary"
          aria-label="Open menu"
        >
          <MoreVertical className="size-5" />
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
