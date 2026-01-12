import { db } from "@/db";
import { subscriptions, users, videoViews } from "@/db/schema";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { z } from "zod";
import { eq, getTableColumns, isNotNull, sql } from "drizzle-orm";

export const usersRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ userId: z.uuid() }))
    .query(async ({ input, ctx }) => {
      let viewerUserId;

      if (ctx?.clerkUserId) {
        const [viewer] = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, ctx.clerkUserId));

        viewerUserId = viewer?.id;
      }

      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select({ creatorId: subscriptions.creatorId })
          .from(subscriptions)
          .where(
            viewerUserId ? eq(subscriptions.viewerId, viewerUserId) : sql`1 = 0`
          )
      );

      const [user] = await db
        .with(viewerSubscriptions)
        .select({
          ...getTableColumns(users),
          videosCount: db.$count(videoViews, eq(videoViews.userId, users.id)),
          subscribersCount: db.$count(
            subscriptions,
            eq(subscriptions.creatorId, users.id)
          ),
          viewerSubscribed: isNotNull(viewerSubscriptions.creatorId).mapWith(
            Boolean
          ),
        })
        .from(users)
        .leftJoin(
          viewerSubscriptions,
          eq(viewerSubscriptions.creatorId, users.id)
        )
        .where(eq(users.id, input.userId));

      return user;
    }),
  getCurrent: baseProcedure.query(async ({ ctx }) => {
    if (!ctx.clerkUserId) return null;

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, ctx.clerkUserId))
      .limit(1);

    return user;
  }),
});
