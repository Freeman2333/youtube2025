"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { MoreVertical, Trash } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/trpc/client";
import type { Comment } from "@/modules/comments/types";

interface CommentItemProps {
  comment: Comment;
  videoId: string;
}

export const CommentItem = ({ comment, videoId }: CommentItemProps) => {
  const { user } = useUser();
  const utils = trpc.useUtils();

  const deleteComment = trpc.comments.remove.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted!");
      utils.comments.getMany.invalidate({ videoId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete comment!");
    },
  });

  const isAuthor = user?.id === comment.user.clerkId;

  return (
    <div className="flex gap-3 mb-8">
      <div className="flex-shrink-0">
        <Link href={`/users/${comment.user.clerkId}`}>
          <UserAvatar
            src={comment.user.imageUrl}
            username={comment.user.name}
            size="default"
          />
        </Link>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/users/${comment.user.id}`}
            className="font-medium text-sm"
          >
            {comment.user.name}
          </Link>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <p className="text-sm text-foreground">{comment.content}</p>
      </div>

      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isAuthor && (
              <DropdownMenuItem
                className="text-destructive cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
                onClick={() => deleteComment.mutate({ id: comment.id })}
                disabled={deleteComment.isPending}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
