import { z } from "zod";
import { eq, desc, getTableColumns } from "drizzle-orm";

import {
  baseProcedure,
  protectedProcedure,
  createTRPCRouter,
} from "@/trpc/init";
import { db } from "@/db";
import { comments, users } from "@/db/schema";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.uuid(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId, content } = input;

      const [comment] = await db
        .insert(comments)
        .values({
          userId,
          videoId,
          content,
        })
        .returning();

      return comment;
    }),
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.uuid(),
      })
    )
    .query(async ({ input }) => {
      const { videoId } = input;

      const data = await db
        .select({
          ...getTableColumns(comments),
          user: getTableColumns(users),
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.videoId, videoId))
        .orderBy(desc(comments.createdAt));
      console.log({ data });

      return data;
    }),
});
