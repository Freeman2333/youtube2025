import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubscriptionButtonProps extends ButtonProps {
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
      disabled={disabled || isLoading}
      {...props}
    >
      {isSubscribed ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
}
