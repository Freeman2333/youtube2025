import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import { UserAvatar } from "@/components/user-avatar";
import { buttonVariants } from "@/components/ui/button";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";

interface VideoOwnerProps {
  userId: string;
  userClerkId: string;
  videoId: string;
  name: string;
  userImage?: string;
  isSubscribed: boolean;
  subscriberCount: number;
}

export const VideoOwner = ({
  userId,
  userClerkId,
  videoId,
  name,
  userImage,
  isSubscribed,
  subscriberCount,
}: VideoOwnerProps) => {
  const { userId: _userClerkId } = useAuth();

  const isVideoOwner = userClerkId === _userClerkId;

  const { toggleSubscription, isPending } = useSubscription(videoId);

  const handleSubscribe = () => {
    toggleSubscription(userId, isSubscribed);
  };

  return (
    <div className="flex items-start justify-between">
      <Link href={`/users/${userId}`} className="flex items-center gap-3">
        <UserAvatar src={userImage} username={name} size="default" />
        <div className="flex flex-col">
          <UserInfo name={name} size="lg" />
          <span className="text-xs text-muted-foreground">
            {subscriberCount} subscriber{+subscriberCount !== 1 ? "s" : ""}
          </span>
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
            isSubscribed={isSubscribed}
            onClick={handleSubscribe}
            disabled={isPending}
          >
            Subscribe
          </SubscriptionButton>
        )}
      </div>
    </div>
  );
};
