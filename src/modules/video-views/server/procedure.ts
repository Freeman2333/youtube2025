import { z } from "zod";

import { db } from "@/db";
import { videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const videoViewsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;

      const [videoView] = await db
        .insert(videoViews)
        .values({ userId, videoId })
        .onConflictDoUpdate({
          target: [videoViews.userId, videoViews.videoId],
          set: { updatedAt: new Date() },
        })
        .returning();

      return videoView;
    }),
});
