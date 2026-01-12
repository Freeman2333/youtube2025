import { Button } from "@/components/ui/button";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SubscriptionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  isSubscribed?: boolean;
}

export function SubscriptionButton({
  className,
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
      className={cn("rounded-full", className)}
      disabled={disabled}
      isLoading={isLoading}
      {...props}
    >
      {isSubscribed ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
}
