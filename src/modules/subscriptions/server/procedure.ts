import { z } from "zod";
import { eq, and, or, desc, lt, getTableColumns } from "drizzle-orm";

import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";

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

  getMany: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z
          .object({
            createdAt: z.date(),
            creatorId: z.uuid(),
          })
          .nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: viewerId } = ctx.user;
      const { limit, cursor } = input;

      const data = await db
        .select({
          ...getTableColumns(users),
          subscribedAt: subscriptions.createdAt,
          subscribersCount: db.$count(
            subscriptions,
            eq(subscriptions.creatorId, users.id)
          ),
        })
        .from(subscriptions)
        .innerJoin(users, eq(subscriptions.creatorId, users.id))
        .where(
          and(
            eq(subscriptions.viewerId, viewerId),
            cursor
              ? or(
                  lt(subscriptions.createdAt, cursor.createdAt),
                  and(
                    eq(subscriptions.createdAt, cursor.createdAt),
                    lt(subscriptions.creatorId, cursor.creatorId)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(subscriptions.createdAt), desc(subscriptions.creatorId))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const last = items[items.length - 1];
      const nextCursor =
        hasMore && last
          ? { createdAt: last.subscribedAt, creatorId: last.id }
          : null;

      return {
        items,
        nextCursor,
      };
    }),
});
