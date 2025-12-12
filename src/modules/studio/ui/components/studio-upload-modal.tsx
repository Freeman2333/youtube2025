"use client";

import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { ResponsiveModal } from "@/components/responsive-modal";
import { StudioUploader } from "./studio-uploader";

export const StudioUploadModal = () => {
  const router = useRouter();
  const utils = trpc.useUtils();

  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("Video created!");
      utils.studio.getMany.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create video!");
    },
  });

  const onSuccess = () => {
    create.reset();
    router.push(`/studio/videos/${create.data?.video.id}`);
  };

  return (
    <>
      <ResponsiveModal
        title="Upload a video"
        description="Upload a video to your studio"
        open={!!create.data}
        onOpenChange={() => create.reset()}
      >
        {create.data?.url ? (
          <StudioUploader endpoint={create.data.url} onSuccess={onSuccess} />
        ) : (
          <Loader2Icon className="size-5 animate-spin" />
        )}
      </ResponsiveModal>

      <Button
        variant="secondary"
        disabled={create.isPending}
        isLoading={create.isPending}
        onClick={() => create.mutate()}
      >
        <PlusIcon />
        Create
      </Button>
    </>
  );
};
