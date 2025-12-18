import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReactionsProps {
  likes?: number;
  dislikes?: number;
  value?: "like" | "dislike" | null;
  onLike?: () => void;
  onDislike?: () => void;
  disabled?: boolean;
}

export const Reactions = ({
  likes = 0,
  dislikes = 0,
  value = null,
  onLike,
  onDislike,
  disabled,
}: ReactionsProps) => {
  return (
    <div className="flex items-center">
      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onClick={onLike}
        className="rounded-l-full rounded-r-none flex items-center gap-1 border-0 transition-colors"
        aria-label="Like"
      >
        <ThumbsUp
          className={cn(
            "size-4 transition-all",
            value === "like"
              ? "text-primary fill-primary"
              : "text-muted-foreground"
          )}
        />

        <span className="text-sm ml-1">{likes}</span>
      </Button>
      <Separator orientation="vertical" className="h-6 mx-0 p-0" />
      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onClick={onDislike}
        className="rounded-r-full rounded-l-none flex items-center gap-1 border-0 transition-colors"
        aria-label="Dislike"
      >
        <ThumbsDown
          className={cn(
            "size-4 transition-all",
            value === "dislike"
              ? "text-primary fill-primary"
              : "text-muted-foreground"
          )}
        />
        <span className="text-sm ml-1">{dislikes}</span>
      </Button>
    </div>
  );
};
