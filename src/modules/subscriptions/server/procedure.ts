import { z } from "zod";
import { eq, and } from "drizzle-orm";

import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";

export const subscriptionsRouter = createTRPCRouter({
  subscribe: protectedProcedure
    .input(
      z.object({
        creatorId: z.uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: viewerId } = ctx.user;
      const { creatorId } = input;

      await db.insert(subscriptions).values({
        viewerId,
        creatorId,
      });

      return { success: true };
    }),
  unsubscribe: protectedProcedure
    .input(
      z.object({
        creatorId: z.uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: viewerId } = ctx.user;
      const { creatorId } = input;

      await db
        .delete(subscriptions)
        .where(
          and(
            eq(subscriptions.viewerId, viewerId),
            eq(subscriptions.creatorId, creatorId)
          )
        );

      return { success: true };
    }),
});
