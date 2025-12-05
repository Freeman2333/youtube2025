"use client";

import { cva } from "class-variance-authority";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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

export const UserAvatar = ({
  src,
  initials,
  size,
  className,
}: {
  src?: string;
  initials?: string;
  size?: "default" | "sm" | "lg" | "xs" | "xl";
  className?: string;
}) => {
  return (
    <Avatar className={cn(avatarVariants({ size }), className)}>
      <AvatarImage src={src || ""} />
      <AvatarFallback className="text-sm font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
