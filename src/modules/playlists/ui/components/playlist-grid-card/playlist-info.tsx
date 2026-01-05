import { MoreVertical, Share2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface PlaylistInfoProps {
  title: string;
}

export const PlaylistInfo = ({ title }: PlaylistInfoProps) => {
  return (
    <div className="mt-3 flex items-start justify-between">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          View full playlist
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Share2 className="size-4 mr-2" />
            <span>Share</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <Trash2 className="size-4 mr-2" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const PlaylistInfoSkeleton = () => {
  return (
    <div className="mt-3 flex items-start justify-between">
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="size-8 rounded-full flex-shrink-0" />
    </div>
  );
};

export default PlaylistInfo;
