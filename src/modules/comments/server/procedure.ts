import { z } from "zod";
import { eq, desc, getTableColumns, and, lt, or, sql } from "drizzle-orm";

import {
  baseProcedure,
  protectedProcedure,
  createTRPCRouter,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { comments, users, commentReactions, ReactionType } from "@/db/schema";

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
        cursor: z
          .object({
            id: z.uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const { videoId, cursor, limit } = input;
      const { clerkUserId } = ctx;

      const [currentUser] = clerkUserId
        ? await db
            .select()
            .from(users)
            .where(eq(users.clerkId, clerkUserId))
            .limit(1)
        : [undefined];

      const totalCountPromise = db.$count(
        comments,
        eq(comments.videoId, videoId)
      );

      const viewerReactionCte = db.$with("viewer_comment_reaction").as(
        db
          .select({
            commentId: commentReactions.commentId,
            type: commentReactions.type,
          })
          .from(commentReactions)
          .where(
            currentUser?.id
              ? eq(commentReactions.userId, currentUser.id)
              : sql`false`
          )
      );

      const dataPromise = db
        .with(viewerReactionCte)
        .select({
          ...getTableColumns(comments),
          user: getTableColumns(users),
          likesCount: db.$count(
            commentReactions,
            and(
              eq(commentReactions.commentId, comments.id),
              eq(commentReactions.type, ReactionType.LIKE)
            )
          ),
          dislikesCount: db.$count(
            commentReactions,
            and(
              eq(commentReactions.commentId, comments.id),
              eq(commentReactions.type, ReactionType.DISLIKE)
            )
          ),
          viewerReaction: sql<
            string | null
          >`coalesce(viewer_comment_reaction.type, null)`,
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .leftJoin(
          viewerReactionCte,
          eq(viewerReactionCte.commentId, comments.id)
        )
        .where(
          and(
            eq(comments.videoId, videoId),
            cursor
              ? or(
                  lt(comments.updatedAt, cursor.updatedAt),
                  and(
                    eq(comments.updatedAt, cursor.updatedAt),
                    lt(comments.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(comments.updatedAt), desc(comments.id))
        // Add 1 to the limit to check if there is more data
        .limit(limit + 1);

      const [totalCount, data] = await Promise.all([
        totalCountPromise,
        dataPromise,
      ]);

      const hasMore = data.length > limit;
      // Remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;
      // Set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
        : null;

      return {
        items,
        nextCursor,
        totalCount,
      };
    }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id } = input;

      const [comment] = await db
        .delete(comments)
        .where(and(eq(comments.id, id), eq(comments.userId, userId)))
        .returning();

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Comment not found or you don't have permission to delete it",
        });
      }

      return comment;
    }),
});
