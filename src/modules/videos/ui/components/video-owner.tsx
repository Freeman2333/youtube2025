"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";

import { UserAvatar } from "@/components/user-avatar";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { UserInfo } from "@/modules/users/ui/components/user-info";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
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
  const { isLoaded, userId: _userClerkId } = useAuth();

  const [hasMounted, setHasMounted] = useState(false);

  const utils = trpc.useUtils();
  const subscriptionMutationOptions: Parameters<
    typeof trpc.subscriptions.subscribe.useMutation
  >[0] = {
    onMutate: async () => {
      await utils.videos.getOne.cancel({ id: videoId });

      const previousVideo = utils.videos.getOne.getData({ id: videoId });

      utils.videos.getOne.setData({ id: videoId }, (old) => {
        if (!old) return old;

        return {
          ...old,
          isSubscribed: !isSubscribed,
          subscriberCount: isSubscribed
            ? Math.max(0, old.subscriberCount - 1)
            : +old.subscriberCount + 1,
        };
      });

      return { previousVideo };
    },
    onError: (_err, _variables, context) => {
      const ctx = context as
        | { previousVideo?: ReturnType<typeof utils.videos.getOne.getData> }
        | undefined;
      if (ctx?.previousVideo) {
        utils.videos.getOne.setData({ id: videoId }, ctx.previousVideo);
      }
    },
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
      utils.subscriptions.getMany.invalidate();
    },
  } as const;

  const { toggleSubscription, isPending } = useSubscription(
    subscriptionMutationOptions
  );

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isVideoOwner =
    isLoaded && hasMounted ? userClerkId === _userClerkId : false;

  const handleSubscribe = () => toggleSubscription(userId, isSubscribed);

  return (
    <div className="flex items-start justify-between">
      <Link
        href={`/users/${userId}`}
        className="flex items-center gap-3"
        prefetch
      >
        <UserAvatar
          src={userImage}
          username={name}
          size="default"
          isLoading={!isLoaded}
        />
        <div className="flex flex-col">
          <UserInfo name={name} size="lg" />
          <span className="text-xs text-muted-foreground">
            {subscriberCount} subscriber{+subscriberCount !== 1 ? "s" : ""}
          </span>
        </div>
      </Link>
      <div className="pl-4 flex">
        {/* TODO: discover why loading runs after skeleton */}
        {!hasMounted || !isLoaded ? (
          <Skeleton className="h-9 w-20 rounded-full" />
        ) : isVideoOwner ? (
          <Link
            prefetch
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
