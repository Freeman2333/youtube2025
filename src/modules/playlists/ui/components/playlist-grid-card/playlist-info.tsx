"use client";

import Link from "next/link";
import { MoreVertical, Share2, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

import { trpc } from "@/trpc/client";
import { APP_URL } from "@/constants";

interface PlaylistInfoProps {
  playlistId: string;
  title: string;
}

export const PlaylistInfo = ({ playlistId, title }: PlaylistInfoProps) => {
  const utils = trpc.useUtils();

  const remove = trpc.playlists.remove.useMutation({
    onSuccess: () => {
      toast.success("Playlist removed");
      utils.playlists.getMany.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCopy = () => {
    const url = `${APP_URL}/playlists/${playlistId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="mt-3 flex items-start justify-between">
      <Link href={`/playlists/${playlistId}`} prefetch>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          View full playlist
        </p>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopy}>
            <Share2 className="size-4 mr-2" />
            <span>Share</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => remove.mutate({ id: playlistId })}
            disabled={remove.isPending}
          >
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
