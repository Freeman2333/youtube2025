"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Trash2, Share } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { trpc } from "@/trpc/client";
import { APP_URL } from "@/constants";

interface PlaylistHeaderProps {
  playlistId: string;
}

const PlaylistHeaderSkeleton = () => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
};

const PlaylistHeaderSuspense = ({ playlistId }: PlaylistHeaderProps) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [playlist] = trpc.playlists.getOne.useSuspenseQuery({ id: playlistId });

  const remove = trpc.playlists.remove.useMutation({
    onSuccess: () => {
      toast.success("Playlist removed");
      utils.playlists.getMany.invalidate();
      router.push("/playlists");
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
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">{playlist.title}</h1>
        <p className="text-muted-foreground">Videos from the playlist</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => remove.mutate({ id: playlistId })}
          disabled={remove.isPending}
        >
          <Trash2 className="text-destructive" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={handleCopy}
        >
          <Share />
        </Button>
      </div>
    </div>
  );
};

export const PlaylistHeader = ({ playlistId }: PlaylistHeaderProps) => {
  return (
    <Suspense fallback={<PlaylistHeaderSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <PlaylistHeaderSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};
