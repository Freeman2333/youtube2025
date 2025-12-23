"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUser, useClerk } from "@clerk/nextjs";
import toast from "react-hot-toast";

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
}

const CommentSchema = CommentInsertSchema.omit({
  userId: true,
  videoId: true,
}).extend({
  content: z.string().trim().min(2, "Comment is too short!"),
});

export const CommentForm = ({ videoId }: CommentFormProps) => {
  const clerk = useClerk();
  const { user, isSignedIn } = useUser();
  const utils = trpc.useUtils();

  const form = useForm<z.infer<typeof CommentSchema>>({
    resolver: zodResolver(CommentSchema),
    defaultValues: {
      content: "",
    },
  });

  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      form.reset();
      utils.comments.getMany.invalidate({ videoId });
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
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3">
        <div className="flex-shrink-0">
          <UserAvatar
            src={user?.imageUrl}
            username={user?.username || ""}
            size="default"
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
                    rows={3}
                    className="resize-none"
                    placeholder="Add a comment..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end mt-2">
            <Button
              type="submit"
              variant="default"
              disabled={createComment.isPending || !form.formState.isValid}
              isLoading={createComment.isPending}
            >
              Comment
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
