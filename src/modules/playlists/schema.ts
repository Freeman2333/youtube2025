import { z } from "zod";

export const createPlaylistSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
});

export type CreatePlaylistInput = z.infer<typeof createPlaylistSchema>;

export default createPlaylistSchema;
