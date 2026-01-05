import { z } from "zod";
import createPlaylistSchema from "@/modules/playlists/schema";
import { eq, and, or, lt, desc, getTableColumns } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import {
  videoViews,
  videos,
  users,
  videoReactions,
  ReactionType,
  playlists,
  playlistVideos,
} from "@/db/schema";

export const playlistsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            createdAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100).default(15),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit } = input;

      const data = await db
        .select({
          ...getTableColumns(playlists),
          videosCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlists.id)
          ),
        })
        .from(playlists)
        .where(
          cursor
            ? or(
                lt(playlists.createdAt, cursor.createdAt),
                and(
                  eq(playlists.createdAt, cursor.createdAt),
                  lt(playlists.id, cursor.id)
                )
              )
            : undefined
        )
        .orderBy(desc(playlists.createdAt), desc(playlists.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, createdAt: lastItem.createdAt }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
  getHistory: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.uuid(),
            viewedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const { id: userId } = ctx.user;

      const userHistory = db.$with("user_history").as(
        db
          .select({
            videoId: videoViews.videoId,
            viewedAt: videoViews.updatedAt,
          })
          .from(videoViews)
          .where(eq(videoViews.userId, userId))
      );

      const data = await db
        .with(userHistory)
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
          viewedAt: userHistory.viewedAt,
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .innerJoin(userHistory, eq(videos.id, userHistory.videoId))
        .where(
          cursor
            ? or(
                lt(userHistory.viewedAt, cursor.viewedAt),
                and(
                  eq(userHistory.viewedAt, cursor.viewedAt),
                  lt(videos.id, cursor.id)
                )
              )
            : undefined
        )
        .orderBy(desc(userHistory.viewedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, viewedAt: lastItem.viewedAt }
        : null;

      return {
        items,
        nextCursor,
      };
    }),

  getLiked: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            reactedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const { id: userId } = ctx.user;

      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            videoId: videoReactions.videoId,
            reactedAt: videoReactions.updatedAt,
          })
          .from(videoReactions)
          .where(
            and(
              eq(videoReactions.userId, userId),
              eq(videoReactions.type, ReactionType.LIKE)
            )
          )
      );

      const data = await db
        .with(viewerReactions)
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
          reactedAt: viewerReactions.reactedAt,
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .innerJoin(viewerReactions, eq(videos.id, viewerReactions.videoId))
        .where(
          cursor
            ? or(
                lt(viewerReactions.reactedAt, cursor.reactedAt),
                and(
                  eq(viewerReactions.reactedAt, cursor.reactedAt),
                  lt(videos.id, cursor.id)
                )
              )
            : undefined
        )
        .orderBy(desc(viewerReactions.reactedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, reactedAt: lastItem.reactedAt }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
  createPlaylist: protectedProcedure
    .input(createPlaylistSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [playlist] = await db
        .insert(playlists)
        .values({
          title: input.title,
          userId,
        })
        .returning();

      return playlist;
    }),
});
