"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { User } from "../../types";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";
import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

export const UserPageInfoSkeleton = () => (
  <div className="w-full flex flex-col items-start gap-4 md:flex-row md:items-start">
    <div className="flex items-center md:items-start gap-4">
      <Skeleton className="block md:hidden w-10 h-10 rounded-full" />
      <Skeleton className="hidden md:block w-24 h-24 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-8 w-40 md:w-64" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-32 md:w-40 mt-4" />
      </div>
    </div>
    <Skeleton className="w-full md:hidden h-10 mt-2" />
  </div>
);

interface UserPageInfoProps {
  user: User;
}

export const UserPageInfo = ({ user }: UserPageInfoProps) => {
  const { user: currentUser, isLoaded } = useUser();
  const clerk = useClerk();
  const isOwner = currentUser?.id === user.clerkId;

  const utils = trpc.useUtils();

  const subscriptionMutationOptions: Parameters<
    typeof trpc.subscriptions.subscribe.useMutation
  >[0] = {
    onMutate: async () => {
      await utils.users.getOne.cancel({ userId: user.id });

      const previousUser = utils.users.getOne.getData({ userId: user.id });

      utils.users.getOne.setData({ userId: user.id }, (old) => {
        if (!old) return old;

        return {
          ...old,
          viewerSubscribed: !user.viewerSubscribed,
          subscribersCount: user.viewerSubscribed
            ? Math.max(0, old.subscribersCount - 1)
            : +old.subscribersCount + 1,
        };
      });

      return { previousUser };
    },
    onError: (_err, _variables, context) => {
      const ctx = context as
        | { previousUser?: ReturnType<typeof utils.users.getOne.getData> }
        | undefined;
      if (ctx?.previousUser) {
        utils.users.getOne.setData({ userId: user.id }, ctx.previousUser);
      }
    },
    onSuccess: () => {
      utils.users.getOne.invalidate({ userId: user.id });
      utils.subscriptions.getMany.invalidate();
    },
  } as const;

  const { toggleSubscription, isPending } = useSubscription(
    subscriptionMutationOptions
  );

  const handleSubscribe = () =>
    toggleSubscription(user.id, user.viewerSubscribed);

  const handleAvatarClick = () => {
    if (!isOwner) return;
    clerk.openUserProfile?.();
  };

  return (
    <div className="w-full flex flex-col items-start gap-4 md:flex-row md:items-start">
      <div className="flex items-center md:items-start gap-4">
        <UserAvatar
          src={user.imageUrl}
          username={user.name}
          size="default"
          className="block md:hidden"
          onClick={handleAvatarClick}
          isLoading={!isLoaded}
        />
        <UserAvatar
          src={user.imageUrl}
          username={user.name}
          size="xl"
          className="hidden md:block"
          onClick={handleAvatarClick}
          isLoading={!isLoaded}
        />
        <div className="text-left flex-1">
          <h1 className="text-2xl font-bold md:text-4xl">{user.name}</h1>
          <p className="text-sm text-muted-foreground">
            {user.subscribersCount} subscribers • {user.videosCount} videos
          </p>

          {/* Desktop-only action*/}
          <div className="mt-4 hidden md:block">
            {isOwner ? (
              <Button className="rounded-full py-3 md:py-2 px-6 text-base md:text-sm">
                <Link href="/studio">
                  <span>Go to Studio</span>
                </Link>
              </Button>
            ) : (
              <SubscriptionButton
                className="rounded-full py-3 md:py-2 px-8 md:px-4 text-base md:text-sm"
                isSubscribed={user.viewerSubscribed}
                onClick={handleSubscribe}
                disabled={isPending}
              />
            )}
          </div>
        </div>
      </div>
      {/* Mobile-only action */}
      <div className="w-full md:hidden">
        {isOwner ? (
          <Button className="w-full rounded-full py-3 px-6 text-base">
            <Link href="/studio">
              <span>Go to Studio</span>
            </Link>
          </Button>
        ) : (
          <SubscriptionButton
            className="w-full rounded-full py-3 px-8 text-base"
            isSubscribed={user.viewerSubscribed}
          />
        )}
      </div>
    </div>
  );
};
