"use client";

import { cva } from "class-variance-authority";
import type { MouseEventHandler } from "react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";

export const avatarVariants = cva(
  "rounded-full overflow-hidden flex items-center justify-center bg-muted text-foreground",
  {
    variants: {
      size: {
        default: "size-9",
        lg: "size-[112px]",
        sm: "size-6",
        xl: "size-[160px]",
        xs: "size-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export type UserAvatarProps = {
  src?: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  email?: string | null;
  size?: "default" | "sm" | "lg" | "xs" | "xl";
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  isLoading?: boolean;
};

export const UserAvatar = ({
  src,
  firstName,
  lastName,
  username,
  email,
  size,
  className,
  onClick,
  isLoading,
}: UserAvatarProps) => {
  let initials;

  if (firstName && lastName) {
    initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
  } else if (username) {
    initials = username.slice(0, 2).toUpperCase();
  } else if (email) {
    initials = email.slice(0, 2).toUpperCase();
  } else {
    initials = "UU";
  }

  if (isLoading) {
    return <Skeleton className={cn(avatarVariants({ size }), className)} />;
  }

  return (
    <Avatar
      className={cn(
        avatarVariants({ size }),
        className,
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <AvatarImage src={src || ""} />
      <AvatarFallback className="text-sm font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
