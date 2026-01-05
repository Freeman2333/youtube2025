"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import createPlaylistSchema, {
  CreatePlaylistInput,
} from "@/modules/playlists/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormItem,
  FormControl,
  FormField,
  FormLabel,
} from "@/components/ui/form";
import { ResponsiveModal } from "@/components/responsive-modal";
import { trpc } from "@/trpc/client";
import { toast } from "react-hot-toast";

interface CreatePlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePlaylistModal = ({
  open,
  onOpenChange,
}: CreatePlaylistModalProps) => {
  const form = useForm<CreatePlaylistInput>({
    resolver: zodResolver(createPlaylistSchema),
    defaultValues: { title: "" },
  });

  const utils = trpc.useUtils();

  const mutation = trpc.playlists.createPlaylist.useMutation({
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
      toast.success("Playlist created!");
      utils.playlists.getMany.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create playlist!");
    },
  });

  const onSubmit = (values: CreatePlaylistInput) => {
    mutation.mutate({ title: values.title });
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create a playlist"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="My favorite videos" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={mutation.isPending || !form.formState.isValid}
            >
              Create
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};

export default CreatePlaylistModal;
