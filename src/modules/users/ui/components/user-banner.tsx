import React from "react";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { User } from "../../types";

export const UserBannerSkeleton = () => (
  <div className="h-28 md:h-40 w-full bg-muted rounded-xl animate-pulse" />
);

interface UserBannerProps {
  bannerUrl?: string;
  user: User;
}

export function UserBanner({ bannerUrl, user }: UserBannerProps) {
  const { user: currentUser } = useUser();
  const isOwner = currentUser?.id === user.clerkId;

  return (
    <div
      className="h-28 md:h-40 w-full bg-gray-100 rounded-xl flex items-center justify-center relative group"
      style={{
        backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {isOwner && (
        <Button
          size="icon"
          className="absolute top-4 right-4 rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100"
        >
          <Pencil />
        </Button>
      )}
    </div>
  );
}
