import { useAuth, useClerk } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";

export const useSubscription = (
  mutationOptions?: Parameters<
    typeof trpc.subscriptions.subscribe.useMutation
  >[0]
) => {
  const { userId: clerkUserId } = useAuth();
  const { openSignIn } = useClerk();

  const subscribeMutation =
    trpc.subscriptions.subscribe.useMutation(mutationOptions);
  const unsubscribeMutation =
    trpc.subscriptions.unsubscribe.useMutation(mutationOptions);

  const toggleSubscription = (creatorId: string, isSubscribed: boolean) => {
    if (!clerkUserId) {
      openSignIn();
      return;
    }

    if (isSubscribed) {
      unsubscribeMutation.mutate({ creatorId });
    } else {
      subscribeMutation.mutate({ creatorId });
    }
  };

  return {
    subscribeMutation,
    unsubscribeMutation,
    toggleSubscription,
    isPending: subscribeMutation.isPending || unsubscribeMutation.isPending,
  };
};
