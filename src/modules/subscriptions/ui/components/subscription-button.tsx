import { Button } from "@/components/ui/button";
import type { ButtonHTMLAttributes } from "react";

interface SubscriptionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  isSubscribed?: boolean;
}

export function SubscriptionButton({
  onClick,
  disabled,
  isLoading,
  isSubscribed,
  ...props
}: SubscriptionButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant={isSubscribed ? "secondary" : "default"}
      className="rounded-full"
      disabled={disabled}
      isLoading={isLoading}
      {...props}
    >
      {isSubscribed ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
}
