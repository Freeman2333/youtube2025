"use client";

import { trpc } from "@/trpc/client";
import { Suspense, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "react-error-boundary";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { RefreshCw, MoreVertical, Trash, ImageIcon, Undo2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { APP_URL } from "@/constants";

import z from "zod";
import { useForm } from "react-hook-form";
import {
  MuxStatus,
  VideoInsertSchema,
  VideoInsertSchemaStrict,
  VideoVisibility,
} from "@/db/schema";
import toast from "react-hot-toast";
import CopyButton from "@/components/copy-button";
import { cn, snakeCaseToTitle } from "@/lib/utils";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { VideoThumbnailUploader } from "@/modules/videos/ui/components/video-thumbnail-uploader";
import Link from "next/link";

const VideosSectionSkeleton = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-3 w-40" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-6 mb-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-40 w-full" />
          </div>

          <div>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-[84px] w-[153px]" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-11 w-48" />
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-gray-100 rounded-lg flex flex-col gap-4">
            <div className="relative aspect-video overflow-hidden rounded-t-lg">
              <Skeleton className="w-full h-full rounded-t-lg" />
            </div>
            <div className="p-4 flex flex-col gap-4">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const FormSection = ({ videoId }: { videoId: string }) => {
  return (
    <Suspense fallback={<VideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const FormSectionSuspense = ({ videoId }: { videoId: string }) => {
  const utils = trpc.useUtils();
  const router = useRouter();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false);

  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      toast.success("Video updated!");
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create video!");
    },
  });

  const removeVideo = trpc.videos.remove.useMutation({
    onSuccess: () => {
      toast.success("Video deleted!");
      utils.studio.getMany.invalidate();

      router.push("/studio");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete video!");
    },
  });

  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to restore video thumbnail!");
    },
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });

      toast.success("Thumbnail restored!");
    },
  });

  const form = useForm<z.infer<typeof VideoInsertSchema>>({
    resolver: zodResolver(VideoInsertSchemaStrict),
    defaultValues: video,
  });

  const fullUrl = `${APP_URL}/videos/${videoId}`;

  const onRefresh = async () => {
    try {
      setIsRefreshing(true);

      await utils.studio.getOne.invalidate({ id: videoId });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to copy video url!"
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-bold">Video details</h1>
          <p className="text-xs text-muted-foreground mb-3">
            Manage your video details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            form="video-form"
            disabled={update.isPending}
            isLoading={update.isPending}
          >
            Save
          </Button>

          <Button
            variant="secondary"
            size="icon"
            disabled={update.isPending || isRefreshing}
            onClick={onRefresh}
          >
            <RefreshCw
              className={cn("size-4", isRefreshing && "animate-spin")}
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="focus:outline-none focus-visible:outline-none focus-visible:ring-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => removeVideo.mutate({ id: videoId })}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Form {...form}>
        <form
          id="video-form"
          className="grid grid-cols-1 lg:grid-cols-5 gap-6"
          onSubmit={form.handleSubmit((values) => update.mutate(values))}
        >
          <div className="lg:col-span-3 flex flex-col gap-6 mb-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={10}
                      className="resize-none pr-10"
                      placeholder="Description"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-3">
                Thumbnail
              </p>
              <div className="group relative h-[84px] w-[153px] border border-dashed bg-neutral-400 p-0.5">
                <Image
                  src={video.thumbnailUrl || "/placeholder.svg"}
                  alt="Thumbnail"
                  fill
                  className="object-cover"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-1 top-1 size-7 rounded-full border border-white/50 bg-black/50 opacity-100 duration-300 hover:bg-black/50 group-hover:opacity-100 data-[state=open]:opacity-100 md:opacity-0 md:disabled:opacity-100"
                    >
                      <MoreVertical className="size-4 text-white" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    side="right"
                    align="start"
                    sideOffset={4}
                    className="w-40"
                  >
                    <DropdownMenuItem
                      onClick={() => setIsThumbnailModalOpen(true)}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Change
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => restoreThumbnail.mutate({ id: videoId })}
                    >
                      <Undo2 className="h-4 w-4 mr-2" />
                      Restore
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <VideoThumbnailUploader
              open={isThumbnailModalOpen}
              onOpenChange={setIsThumbnailModalOpen}
              videoId={videoId}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-gray-100 rounded-lg flex flex-col gap-4">
              <div className="relative aspect-video overflow-hidden rounded-t-lg">
                <VideoPlayer
                  playbackId={video.muxPlaybackId}
                  duration={video.duration}
                  thumbnailUrl={video.thumbnailUrl}
                  key={video.thumbnailUrl}
                  previewUrl={video.previewUrl}
                  title={video.title}
                />
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Video Link
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/videos/${videoId}`}
                      className="text-sm text-blue-600 truncate"
                    >
                      {fullUrl}
                    </Link>
                    <CopyButton textToCopy={fullUrl} />
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Video status
                  </span>
                  <span className="text-sm">
                    {snakeCaseToTitle(video.muxStatus || MuxStatus.PREPARING)}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Subtitles status
                  </span>
                  <span className="text-sm">
                    {snakeCaseToTitle(video.muxTrackStatus || "no_subtitles")}
                  </span>
                </div>
              </div>
            </div>
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(VideoVisibility).map(([key, value]) => (
                        <SelectItem key={value} value={value}>
                          {snakeCaseToTitle(key) || key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
};
