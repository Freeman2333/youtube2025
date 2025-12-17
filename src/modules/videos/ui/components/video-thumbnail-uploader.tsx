import { useState } from "react";
import { ResponsiveModal } from "@/components/responsive-modal";
import { trpc } from "@/trpc/client";
import { UploadDropzone } from "@/utils/uploadthing";

interface VideoThumbnailUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
}

export const VideoThumbnailUploader = ({
  open,
  onOpenChange,
  videoId,
}: VideoThumbnailUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const utils = trpc.useUtils();

  const onUploadComplete = () => {
    utils.studio.getMany.invalidate();
    utils.studio.getOne.invalidate({ id: videoId });
    setIsUploading(false);
    onOpenChange(false);
  };

  return (
    <ResponsiveModal
      open={open || isUploading}
      onOpenChange={onOpenChange}
      title="Upload Thumbnail"
      description="Upload a video thumbnail"
    >
      <UploadDropzone
        endpoint="imageUploader"
        onClientUploadComplete={onUploadComplete}
        onUploadBegin={(files) => {
          setIsUploading(true);
          return files;
        }}
        onUploadAborted={() => setIsUploading(false)}
        onUploadError={() => setIsUploading(false)}
        input={{ videoId }}
      />
    </ResponsiveModal>
  );
};
