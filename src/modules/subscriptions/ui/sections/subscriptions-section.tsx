"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useMemo } from "react";
import { trpc } from "@/trpc/client";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";
import { UserAvatar } from "@/components/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { SubscriptionItem } from "@/modules/subscriptions/ui/components/subscription-item";
import { DEFAULT_LIMIT } from "@/constants";

const SubscriptionsSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between border-b pb-4"
        >
          <div className="flex items-center gap-4">
            <UserAvatar isLoading size="default" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      ))}
    </div>
  );
};

export const SubscriptionsSection = () => {
  return (
    <Suspense fallback={<SubscriptionsSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <SubscriptionsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const SubscriptionsSectionSuspense = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.subscriptions.getMany.useInfiniteQuery(
      { limit: DEFAULT_LIMIT },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const subscriptions = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const utils = trpc.useUtils();

  const subscriptionMutationOptions = {
    onSuccess: () => {
      utils.subscriptions.getMany.invalidate();
    },
  } as const;

  const { toggleSubscription, isPending } = useSubscription(
    subscriptionMutationOptions
  );

  return (
    <div className="flex flex-col gap-6">
      {subscriptions.map((user) => (
        <SubscriptionItem
          key={user.id}
          name={user.name}
          imageUrl={user.imageUrl}
          subscribersCount={user.subscribersCount}
          isSubscribed={true}
          isLoading={isPending}
          onToggle={() => toggleSubscription(user.id, true)}
        />
      ))}
      <InfiniteScroll
        fetchNextPage={fetchNextPage}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={!!isFetchingNextPage}
      />
    </div>
  );
};
