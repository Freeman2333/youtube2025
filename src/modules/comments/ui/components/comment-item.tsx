"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { MoreVertical, Trash, ChevronDown, ChevronUp } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { useState } from "react";

import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/trpc/client";
import { CommentReactions } from "@/modules/comment-reactions/ui/components/comment-reactions";
import { CommentForm } from "@/modules/comments/ui/components/comment-form";
import { RepliesSection } from "./replies-section";
import { cn } from "@/lib/utils";
import type { Comment } from "@/modules/comments/types";

interface CommentItemProps {
  comment: Comment;
  videoId: string;
}

export const CommentItem = ({ comment, videoId }: CommentItemProps) => {
  const { user } = useUser();
  const utils = trpc.useUtils();
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const isReply = !!comment.parentId;

  const handleReplySuccess = () => {
    setIsReplying(false);
    setShowReplies(true);
  };

  const deleteComment = trpc.comments.remove.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted!");
      utils.comments.getMany.invalidate({ videoId });

      if (isReply) {
        utils.comments.getMany.invalidate({ parentId: comment.parentId! });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete comment!");
    },
  });

  const isAuthor = user?.id === comment.user.clerkId;

  return (
    <div
      className={cn(
        "mb-5",
        isReply && "ml-4 mb-3 pl-4 border-l-2 border-gray-100"
      )}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Link href={`/users/${comment.user.clerkId}`}>
            <UserAvatar
              src={comment.user.imageUrl}
              username={comment.user.name}
              size={isReply ? "sm" : "default"}
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

          <div className="flex items-center gap-1 mt-2">
            <CommentReactions
              commentId={comment.id}
              videoId={videoId}
              likesCount={comment.likesCount}
              dislikesCount={comment.dislikesCount}
              viewerReaction={comment.viewerReaction}
              parentCommentId={comment.parentId}
            />

            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs font-medium hover:text-foreground px-4 rounded-full"
              >
                Reply
              </Button>
            )}
          </div>
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

      {!isReply && isReplying && (
        <div className="mt-4 pl-4 border-muted">
          <CommentForm
            videoId={videoId}
            parentId={comment.id}
            variant="reply"
            onCancel={() => setIsReplying(false)}
            onSuccess={handleReplySuccess}
          />
        </div>
      )}

      {!isReply && comment.repliesCount > 0 && (
        <div className="mt-2 ml-[50px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 px-4 rounded-full"
          >
            {showReplies ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                {comment.repliesCount}{" "}
                {comment.repliesCount === 1 ? "reply" : "replies"}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                {comment.repliesCount}{" "}
                {comment.repliesCount === 1 ? "reply" : "replies"}
              </>
            )}
          </Button>
        </div>
      )}

      {!isReply && showReplies && (
        <RepliesSection commentId={comment.id} videoId={videoId} />
      )}
    </div>
  );
};
