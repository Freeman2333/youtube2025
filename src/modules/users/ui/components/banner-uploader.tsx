import { useState } from "react";
import { ResponsiveModal } from "@/components/responsive-modal";
import { trpc } from "@/trpc/client";
import { UploadDropzone } from "@/utils/uploadthing";

interface BannerUploaderProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BannerUploader = ({
  open,
  onOpenChange,
  userId,
}: BannerUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const utils = trpc.useUtils();

  const onUploadComplete = () => {
    utils.users.getOne.invalidate({ userId });
    setIsUploading(false);
    onOpenChange(false);
  };

  return (
    <ResponsiveModal
      open={open || isUploading}
      onOpenChange={onOpenChange}
      title="Upload Banner"
      description="Upload a banner image"
    >
      <UploadDropzone
        endpoint="bannerUploader"
        onClientUploadComplete={onUploadComplete}
        onUploadBegin={(files) => {
          setIsUploading(true);
          return files;
        }}
        onUploadAborted={() => setIsUploading(false)}
      />
    </ResponsiveModal>
  );
};
