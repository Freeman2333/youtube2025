import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { users, videoReactions } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const videoReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(
      z.object({
        videoId: z.uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user: clerkUser } = ctx;
      const { videoId } = input;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUser.clerkId));

      const [currentReaction] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.userId, user.id),
            eq(videoReactions.videoId, videoId)
          )
        )
        .limit(1);

      if (currentReaction?.type === "like") {
        await db
          .delete(videoReactions)
          .where(
            and(
              eq(videoReactions.userId, user.id),
              eq(videoReactions.videoId, videoId)
            )
          );
        return { success: true, reaction: null };
      } else if (currentReaction?.type === "dislike") {
        await db
          .update(videoReactions)
          .set({ type: "like", updatedAt: new Date() })
          .where(
            and(
              eq(videoReactions.userId, user.id),
              eq(videoReactions.videoId, videoId)
            )
          );
        return { success: true, reaction: "like" };
      } else {
        await db.insert(videoReactions).values({
          userId: user.id,
          videoId,
          type: "like",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return { success: true, reaction: "like" };
      }
    }),
  dislike: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user: clerkUser } = ctx;
      const { videoId } = input;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUser.clerkId));

      if (!user) {
        throw new Error("User not found");
      }

      const [currentReaction] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.userId, user.id),
            eq(videoReactions.videoId, videoId)
          )
        )
        .limit(1);

      if (currentReaction?.type === "dislike") {
        await db
          .delete(videoReactions)
          .where(
            and(
              eq(videoReactions.userId, user.id),
              eq(videoReactions.videoId, videoId)
            )
          );
        return { success: true, reaction: null };
      } else if (currentReaction?.type === "like") {
        await db
          .update(videoReactions)
          .set({ type: "dislike", updatedAt: new Date() })
          .where(
            and(
              eq(videoReactions.userId, user.id),
              eq(videoReactions.videoId, videoId)
            )
          );
        return { success: true, reaction: "dislike" };
      } else {
        await db.insert(videoReactions).values({
          userId: user.id,
          videoId,
          type: "dislike",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return { success: true, reaction: "dislike" };
      }
    }),
});
