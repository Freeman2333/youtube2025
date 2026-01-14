import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { User } from "../../types";
import { BannerUploader } from "./banner-uploader";

export const UserBannerSkeleton = () => (
  <div className="h-28 md:h-40 w-full bg-muted rounded-xl animate-pulse" />
);

interface UserBannerProps {
  user: User;
}

export function UserBanner({ user }: UserBannerProps) {
  const { user: currentUser } = useUser();
  const isOwner = currentUser?.id === user.clerkId;

  const [uploaderOpen, setUploaderOpen] = useState(false);

  return (
    <div
      className="h-28 md:h-40 w-full bg-gray-100 rounded-xl flex items-center justify-center relative group"
      style={{
        backgroundImage: user.bannerUrl ? `url(${user.bannerUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {isOwner && (
        <>
          <Button
            size="icon"
            className="absolute top-4 right-4 rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100"
            onClick={() => setUploaderOpen(true)}
          >
            <Pencil />
          </Button>
          <BannerUploader
            userId={user.id}
            open={uploaderOpen}
            onOpenChange={setUploaderOpen}
          />
        </>
      )}
    </div>
  );
}
