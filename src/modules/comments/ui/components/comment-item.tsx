"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { UserAvatar } from "@/components/user-avatar";
import type { Comment } from "@/modules/comments/types";

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem = ({ comment }: CommentItemProps) => {
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
    </div>
  );
};
