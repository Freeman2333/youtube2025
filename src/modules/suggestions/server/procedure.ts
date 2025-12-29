import { and, desc, eq, lt, ne, or, getTableColumns } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  videos,
  users,
  VideoVisibility,
  videoViews,
  videoReactions,
  ReactionType,
} from "@/db/schema";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const suggestionsRouter = createTRPCRouter({
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
        limit: z.number().min(1).max(100).default(15),
      })
    )
    .query(async ({ input }) => {
      const { videoId, cursor, limit } = input;

      const currentVideo = await db
        .select({
          id: videos.id,
          categoryId: videos.categoryId,
          userId: videos.userId,
        })
        .from(videos)
        .where(eq(videos.id, videoId))
        .limit(1)
        .then((videos) => videos[0]);

      if (!currentVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: users,
          viewsCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likesCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, ReactionType.LIKE)
            )
          ),
          dislikesCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, ReactionType.DISLIKE)
            )
          ),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            ne(videos.id, videoId),
            eq(videos.visibility, VideoVisibility.PUBLIC),
            currentVideo.categoryId
              ? eq(videos.categoryId, currentVideo.categoryId)
              : undefined,
            cursor
              ? or(
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
});
