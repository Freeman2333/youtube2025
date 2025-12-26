import { z } from "zod";
import { eq, and } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { commentReactions, ReactionType } from "@/db/schema";

export const commentReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(
      z.object({
        commentId: z.uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { commentId } = input;

      const [existingReaction] = await db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.userId, userId),
            eq(commentReactions.commentId, commentId)
          )
        );

      if (existingReaction) {
        if (existingReaction.type === ReactionType.LIKE) {
          await db
            .delete(commentReactions)
            .where(
              and(
                eq(commentReactions.userId, userId),
                eq(commentReactions.commentId, commentId)
              )
            );
        } else {
          await db
            .update(commentReactions)
            .set({
              type: ReactionType.LIKE,
            })
            .where(
              and(
                eq(commentReactions.userId, userId),
                eq(commentReactions.commentId, commentId)
              )
            );
        }
      } else {
        await db.insert(commentReactions).values({
          userId,
          commentId,
          type: ReactionType.LIKE,
        });
      }

      return { success: true };
    }),

  dislike: protectedProcedure
    .input(
      z.object({
        commentId: z.uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { commentId } = input;

      const [existingReaction] = await db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.userId, userId),
            eq(commentReactions.commentId, commentId)
          )
        );

      if (existingReaction) {
        if (existingReaction.type === ReactionType.DISLIKE) {
          await db
            .delete(commentReactions)
            .where(
              and(
                eq(commentReactions.userId, userId),
                eq(commentReactions.commentId, commentId)
              )
            );
        } else {
          await db
            .update(commentReactions)
            .set({
              type: ReactionType.DISLIKE,
            })
            .where(
              and(
                eq(commentReactions.userId, userId),
                eq(commentReactions.commentId, commentId)
              )
            );
        }
      } else {
        await db.insert(commentReactions).values({
          userId,
          commentId,
          type: ReactionType.DISLIKE,
        });
      }

      return { success: true };
    }),
});
