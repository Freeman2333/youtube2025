import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import { UserAvatar } from "@/components/user-avatar";
import { buttonVariants } from "@/components/ui/button";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { cn } from "@/lib/utils";

interface VideoOwnerProps {
  userId: string;
  userClerkId: string;
  videoId: string;
  name: string;
  userImage?: string;
}

export const VideoOwner = ({
  userId,
  userClerkId,
  videoId,
  name,
  userImage,
}: VideoOwnerProps) => {
  const { userId: _userClerkId } = useAuth();

  const isVideoOwner = userClerkId === _userClerkId;
  return (
    <div className="flex items-start justify-between">
      <Link href={`/users/${userId}`} className="flex items-center gap-3">
        <UserAvatar src={userImage} username={name} size="default" />
        <div className="flex flex-col">
          <UserInfo name={name} />
          <span className="text-xs text-muted-foreground">{0} subscribers</span>
        </div>
      </Link>
      <div className="pl-4 flex">
        {isVideoOwner ? (
          <Link
            href={`/studio/videos/${videoId}`}
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "rounded-full"
            )}
          >
            Edit video
          </Link>
        ) : (
          <SubscriptionButton
            isSubscribed={false}
            onClick={() => console.log("Subscribe")}
            disabled={false}
          >
            Subscribe
          </SubscriptionButton>
        )}
      </div>
    </div>
  );
};
