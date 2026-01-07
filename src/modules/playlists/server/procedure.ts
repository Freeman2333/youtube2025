import { z } from "zod";
import createPlaylistSchema from "@/modules/playlists/schema";
import {
  eq,
  and,
  or,
  lt,
  desc,
  getTableColumns,
  exists,
  max,
} from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { TRPCError } from "@trpc/server";
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
            id: z.uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100).default(15),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      const latestVideos = db.$with("latest_videos").as(
        db
          .select({
            playlistId: playlistVideos.playlistId,
            maxCreatedAt: max(playlistVideos.createdAt).as("max_created_at"),
          })
          .from(playlistVideos)
          .groupBy(playlistVideos.playlistId)
      );

      const data = await db
        .with(latestVideos)
        .select({
          ...getTableColumns(playlists),
          videosCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlists.id)
          ),
          thumbnailUrl: videos.thumbnailUrl,
        })
        .from(playlists)
        .leftJoin(latestVideos, eq(playlists.id, latestVideos.playlistId))
        .leftJoin(
          playlistVideos,
          and(
            eq(playlistVideos.playlistId, latestVideos.playlistId),
            eq(playlistVideos.createdAt, latestVideos.maxCreatedAt)
          )
        )
        .leftJoin(videos, eq(playlistVideos.videoId, videos.id))
        .where(
          and(
            eq(playlists.userId, userId),
            cursor
              ? or(
                  lt(playlists.updatedAt, cursor.updatedAt),
                  and(
                    eq(playlists.updatedAt, cursor.updatedAt),
                    lt(playlists.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playlists.updatedAt), desc(playlists.id))
        .limit(limit + 1);

      console.log({ data });

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
  getOne: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [playlist] = await db
        .select({
          ...getTableColumns(playlists),
          videosCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlists.id)
          ),
        })
        .from(playlists)
        .where(and(eq(playlists.id, input.id), eq(playlists.userId, userId)));

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      return playlist;
    }),
  getVideos: protectedProcedure
    .input(
      z.object({
        playlistId: z.uuid(),
        cursor: z
          .object({
            id: z.uuid(),
            createdAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { playlistId, cursor, limit } = input;

      const [playlist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
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
          createdAt: playlistVideos.createdAt,
        })
        .from(playlistVideos)
        .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            cursor
              ? or(
                  lt(playlistVideos.createdAt, cursor.createdAt),
                  and(
                    eq(playlistVideos.createdAt, cursor.createdAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playlistVideos.createdAt), desc(videos.id))
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
  getManyForVideo: protectedProcedure
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
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId, cursor, limit } = input;

      const data = await db
        .select({
          ...getTableColumns(playlists),
          containsVideo: exists(
            db
              .select()
              .from(playlistVideos)
              .where(
                and(
                  eq(playlistVideos.playlistId, playlists.id),
                  eq(playlistVideos.videoId, videoId)
                )
              )
          ),
        })
        .from(playlists)
        .where(
          and(
            eq(playlists.userId, userId),
            cursor
              ? or(
                  lt(playlists.updatedAt, cursor.updatedAt),
                  and(
                    eq(playlists.updatedAt, cursor.updatedAt),
                    lt(playlists.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playlists.updatedAt), desc(playlists.id))
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
  addToPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.uuid(),
        videoId: z.uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { playlistId, videoId } = input;

      const [playlist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      const [existingEntry] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        );

      if (existingEntry) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Video already in playlist",
        });
      }

      const [playlistVideo] = await db
        .insert(playlistVideos)
        .values({
          playlistId,
          videoId,
        })
        .returning();

      return playlistVideo;
    }),
  removeFromPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.uuid(),
        videoId: z.uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { playlistId, videoId } = input;

      const [playlist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      const [deletedEntry] = await db
        .delete(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        )
        .returning();

      if (!deletedEntry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found in playlist",
        });
      }

      return deletedEntry;
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
  remove: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [deletedPlaylist] = await db
        .delete(playlists)
        .where(and(eq(playlists.id, input.id), eq(playlists.userId, userId)))
        .returning();

      if (!deletedPlaylist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      return deletedPlaylist;
    }),
});
