import { z } from "zod";
import {
  eq,
  desc,
  getTableColumns,
  and,
  lt,
  or,
  sql,
  isNull,
  isNotNull,
  count,
} from "drizzle-orm";

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
        parentId: z.uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId, content, parentId } = input;

      const [comment] = await db
        .insert(comments)
        .values({
          userId,
          videoId,
          content,
          ...(parentId && { parentId }),
        })
        .returning();

      return comment;
    }),
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.uuid().optional(),
        parentId: z.uuid().optional(),
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
      const { videoId, parentId, cursor, limit } = input;
      const { clerkUserId } = ctx;

      if (!videoId && !parentId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either videoId or parentId must be provided",
        });
      }

      const currentUser = clerkUserId
        ? await db
            .select()
            .from(users)
            .where(eq(users.clerkId, clerkUserId))
            .limit(1)
            .then((users) => users[0])
        : undefined;

      const isTopLevelComments = Boolean(videoId && !parentId);

      const whereConditions = [];

      if (videoId) {
        whereConditions.push(eq(comments.videoId, videoId));
      }

      if (parentId) {
        whereConditions.push(eq(comments.parentId, parentId));
      } else if (isTopLevelComments) {
        whereConditions.push(isNull(comments.parentId));
      }

      if (cursor) {
        whereConditions.push(
          or(
            lt(comments.updatedAt, cursor.updatedAt),
            and(
              eq(comments.updatedAt, cursor.updatedAt),
              lt(comments.id, cursor.id)
            )
          )
        );
      }

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

      const repliesCountCte = db.$with("replies_count").as(
        db
          .select({
            parentId: comments.parentId,
            count: count(comments.id).as("count"),
          })
          .from(comments)
          .where(isNotNull(comments.parentId))
          .groupBy(comments.parentId)
      );

      const commentsQuery = db
        .with(viewerReactionCte, repliesCountCte)
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
          repliesCount: sql<number>`coalesce(${repliesCountCte.count}, 0)`,
          viewerReaction: sql<
            string | null
          >`coalesce(${viewerReactionCte.type}, null)`,
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .leftJoin(
          viewerReactionCte,
          eq(viewerReactionCte.commentId, comments.id)
        )
        .leftJoin(repliesCountCte, eq(repliesCountCte.parentId, comments.id))
        .where(and(...whereConditions))
        .orderBy(desc(comments.updatedAt), desc(comments.id))
        // Add 1 to the limit to check if there is more data
        .limit(limit + 1);

      const totalCountQuery =
        isTopLevelComments && videoId
          ? db.$count(comments, eq(comments.videoId, videoId))
          : Promise.resolve(null);

      const [data, totalCount] = await Promise.all([
        commentsQuery,
        totalCountQuery,
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
