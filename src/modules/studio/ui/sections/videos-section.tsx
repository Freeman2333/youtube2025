"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";

export const VideosSection = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <VideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

export const VideosSectionSuspense = () => {
  const router = useRouter();

  const [data, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const videos = data.pages.flatMap((p) => p.items);

  return (
    <div>
      <Table className="bg-white rounded-md border-collapse">
        <TableHeader>
          <TableRow className="border-y">
            <TableHead className="w-[510px] pl-6">Video</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead className="text-right">Comments</TableHead>
            <TableHead className="pr-6 text-right">Likes</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {videos.map((video) => (
            <TableRow
              key={video.id}
              className="cursor-pointer hover:bg-muted/50 border-b"
              onClick={() => router.push(`/studio/videos/${video.id}`)}
            >
              <TableCell className="font-medium pl-6">{video.title}</TableCell>

              <TableCell>{video.visibility}</TableCell>
              <TableCell>{video.status}</TableCell>

              <TableCell>
                {video.createdAt
                  ? format(new Date(video.createdAt), "dd MMM yyyy")
                  : "-"}
              </TableCell>

              <TableCell className="text-right">{video.views ?? 0}</TableCell>
              <TableCell className="text-right">
                {video.commentsCount ?? 0}
              </TableCell>
              <TableCell className="pr-6 text-right">
                {video.likes ?? 0}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <InfiniteScroll
        isManual
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
};
