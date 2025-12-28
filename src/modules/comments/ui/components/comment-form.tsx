"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUser, useClerk } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { UserAvatar } from "@/components/user-avatar";
import { trpc } from "@/trpc/client";
import { CommentInsertSchema } from "@/db/schema";

interface CommentFormProps {
  videoId: string;
  parentId?: string;
  variant?: "main" | "reply";
  onCancel?: () => void;
  onSuccess?: () => void;
}

const CommentSchema = CommentInsertSchema.omit({
  userId: true,
  videoId: true,
}).extend({
  content: z.string().trim().min(2, "Comment is too short!"),
});

export const CommentForm = ({
  videoId,
  parentId,
  variant = "main",
  onCancel,
  onSuccess,
}: CommentFormProps) => {
  const clerk = useClerk();
  const { user, isSignedIn } = useUser();
  const utils = trpc.useUtils();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const form = useForm<z.infer<typeof CommentSchema>>({
    resolver: zodResolver(CommentSchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    if (variant === "reply" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [variant]);

  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      form.reset();
      utils.comments.getMany.invalidate({ videoId });

      if (variant === "reply") {
        utils.comments.getMany.invalidate({ parentId: parentId });
      }

      onSuccess?.();
      onCancel?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add comment!");
    },
  });

  const onSubmit = (values: z.infer<typeof CommentSchema>) => {
    if (!isSignedIn) {
      clerk.openSignIn();
      return;
    }

    createComment.mutate({
      videoId,
      content: values.content,
      ...(parentId && { parentId }),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3">
        <div className="flex-shrink-0">
          <UserAvatar
            src={user?.imageUrl}
            username={user?.username || ""}
            size={variant === "reply" ? "sm" : "default"}
          />
        </div>
        <div className="flex-1">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    rows={variant === "reply" ? 2 : 3}
                    className="resize-none"
                    disabled={createComment.isPending}
                    placeholder={
                      variant === "reply"
                        ? "Add a reply..."
                        : "Add a comment..."
                    }
                    {...field}
                    ref={(e) => {
                      field.ref(e);
                      if (e) textareaRef.current = e;
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2 mt-2">
            {variant === "reply" && onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="default"
              disabled={createComment.isPending || !form.formState.isValid}
              isLoading={createComment.isPending}
            >
              {variant === "reply" ? "Reply" : "Comment"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
