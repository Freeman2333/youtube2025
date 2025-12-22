import { useAuth, useClerk } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";

export const useSubscription = (videoId: string) => {
  const { userId: clerkUserId } = useAuth();
  const { openSignIn } = useClerk();
  const utils = trpc.useUtils();

  const subscribeMutation = trpc.subscriptions.subscribe.useMutation({
    onMutate: async () => {
      await utils.videos.getOne.cancel({ id: videoId });

      const previousVideo = utils.videos.getOne.getData({ id: videoId });

      utils.videos.getOne.setData({ id: videoId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          isSubscribed: true,
          subscriberCount: old.subscriberCount + 1,
        };
      });

      return { previousVideo };
    },
    onError: (err, variables, context) => {
      if (context?.previousVideo) {
        utils.videos.getOne.setData({ id: videoId }, context.previousVideo);
      }
    },
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
    },
  });

  const unsubscribeMutation = trpc.subscriptions.unsubscribe.useMutation({
    onMutate: async () => {
      await utils.videos.getOne.cancel({ id: videoId });

      const previousVideo = utils.videos.getOne.getData({ id: videoId });

      utils.videos.getOne.setData({ id: videoId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          isSubscribed: false,
          subscriberCount: Math.max(0, old.subscriberCount - 1),
        };
      });

      return { previousVideo };
    },
    onError: (err, variables, context) => {
      if (context?.previousVideo) {
        utils.videos.getOne.setData({ id: videoId }, context.previousVideo);
      }
    },
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
    },
  });

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
