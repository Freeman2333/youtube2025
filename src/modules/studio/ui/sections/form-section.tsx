"use client";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { RefreshCw, MoreVertical, Trash } from "lucide-react";

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

import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import z from "zod";
import { useForm } from "react-hook-form";
import { VideoInsertSchema, VideoInsertSchemaStrict } from "@/db/schema";
import toast from "react-hot-toast";

const VideosSectionSkeleton = () => {
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
          {Array.from({ length: 5 }).map((_, idx) => (
            <TableRow key={idx} className="border-b">
              <TableCell className="pl-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-36 aspect-video rounded-md" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-[280px]" />
                    <Skeleton className="h-3 w-[200px]" />
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>

              <TableCell className="text-right">
                <Skeleton className="h-4 w-10 ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-10 ml-auto" />
              </TableCell>
              <TableCell className="pr-6 text-right">
                <Skeleton className="h-4 w-10 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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

  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      toast.success("Video updated!");
      utils.studio.getMany.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create video!");
    },
  });

  const form = useForm<z.infer<typeof VideoInsertSchema>>({
    resolver: zodResolver(VideoInsertSchemaStrict),
    defaultValues: video,
  });

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
            disabled={update.isPending}
            isLoading={update.isPending}
          >
            <RefreshCw className="h-4 w-4" />
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
              <DropdownMenuItem className="text-destructive">
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

            {/* Thumbnail */}

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

          <div className="lg:col-span-2">Right content</div>
        </form>
      </Form>
    </div>
  );
};
