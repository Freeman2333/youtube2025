import { UserAvatar } from "@/components/user-avatar";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";

interface SubscriptionItemProps {
  name: string;
  imageUrl: string;
  subscribersCount: number;
  isSubscribed: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

export function SubscriptionItem({
  name,
  imageUrl,
  subscribersCount,
  isSubscribed,
  isLoading,
  onToggle,
}: SubscriptionItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <UserAvatar src={imageUrl} firstName={name} size="default" />
        <div>
          <h3 className="text-sm">{name}</h3>
          <p className="text-xs text-muted-foreground">
            {subscribersCount} subscriber
            {subscribersCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      <SubscriptionButton
        isSubscribed={isSubscribed}
        isLoading={isLoading}
        onClick={onToggle}
        size="sm"
      />
    </div>
  );
}
