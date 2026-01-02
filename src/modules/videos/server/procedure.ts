import { db } from "@/db";
import {
  MuxStatus,
  VideoInsertSchemaStrict,
  videos,
  users,
  videoViews,
  videoReactions,
  ReactionType,
  subscriptions,
} from "@/db/schema";
import { mux } from "@/lib/mux";
import {
  createTRPCRouter,
  protectedProcedure,
  baseProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";
import { UTApi } from "uploadthing/server";
import { ensureNoExistingUploadthingFiles } from "@/utils/uploadthing-server";

import { APP_URL } from "@/constants";

export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    const upload = await mux.video.uploads.create({
      cors_origin: APP_URL,
      new_asset_settings: {
        passthrough: userId,
        playback_policy: ["public"],
        inputs: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English CC",
              },
              {
                language_code: "uk",
                name: "Ukrainian CC",
              },
            ],
          },
        ],
      },
    });

    const [video] = await db
      .insert(videos)
      .values({
        muxStatus: MuxStatus.WAITING,
        muxUploadId: upload.id,
        title: "Untitled",
        description: "",
        userId,
      })
      .returning();

    return { url: upload.url, video };
  }),
  update: protectedProcedure
    .input(VideoInsertSchemaStrict)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id, categoryId, description, title, visibility } = input;

      if (!id)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video id not found!",
        });

      const [video] = await db
        .update(videos)
        .set({
          categoryId,
          description,
          title,
          visibility,
        })
        .where(and(eq(videos.id, id), eq(videos.userId, userId)))
        .returning();

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      return video;
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

      const [video] = await db
        .delete(videos)
        .where(and(eq(videos.id, id), eq(videos.userId, userId)))
        .returning();

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      await ensureNoExistingUploadthingFiles(video);

      return video;
    }),
  restoreThumbnail: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id } = input;

      const utapi = new UTApi();

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, id), eq(videos.userId, userId)));

      if (!existingVideo)
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found!" });

      if (!existingVideo.muxPlaybackId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Playback id not found!",
        });

      await ensureNoExistingUploadthingFiles(existingVideo);

      const muxThumbnailUrl = `${process.env.NEXT_PUBLIC_MUX_IMAGE_BASE_URL}/${existingVideo.muxPlaybackId}/thumbnail.jpg`;
      const uploadedThumbnail = await utapi.uploadFilesFromUrl(muxThumbnailUrl);

      if (!uploadedThumbnail.data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload thumbnail!",
        });
      }

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } =
        uploadedThumbnail.data;

      const [updatedVideo] = await db
        .update(videos)
        .set({ thumbnailKey, thumbnailUrl })
        .where(and(eq(videos.id, id), eq(videos.userId, userId)))
        .returning();

      return updatedVideo;
    }),
  getOne: baseProcedure
    .input(
      z.object({
        id: z.uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const { clerkUserId } = ctx;

      const [currentUser] = clerkUserId
        ? await db
            .select()
            .from(users)
            .where(eq(users.clerkId, clerkUserId))
            .limit(1)
        : [undefined];

      const viewerReactionCte = db.$with("viewer_reaction").as(
        db
          .select({
            videoId: videoReactions.videoId,
            type: videoReactions.type,
          })
          .from(videoReactions)
          .where(
            and(
              eq(videoReactions.videoId, id),
              currentUser?.id
                ? eq(videoReactions.userId, currentUser.id)
                : sql`false`
            )
          )
          .limit(1)
      );

      const subscriptionCte = db.$with("subscription_cte").as(
        db
          .select({
            creatorId: subscriptions.creatorId,
            subscriberCount: sql<number>`count(*) as subscriberCount`,
            isSubscribed: sql<boolean>`bool_or(subscriptions.viewer_id = ${
              currentUser?.id ?? sql`null`
            }) as isSubscribed`,
          })
          .from(subscriptions)
          .groupBy(subscriptions.creatorId)
      );

      const [videoWithUser] = await db
        .with(viewerReactionCte, subscriptionCte)
        .select({
          video: videos,
          user: users,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
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
          viewerReaction: sql<
            string | null
          >`coalesce(viewer_reaction.type, null)`,
          subscriberCount: sql<number>`coalesce(subscription_cte.subscriberCount, 0)`,
          isSubscribed: sql<boolean>`coalesce(subscription_cte.isSubscribed, false)`,
        })
        .from(videos)
        .innerJoin(users, eq(users.id, videos.userId))
        .leftJoin(viewerReactionCte, eq(viewerReactionCte.videoId, videos.id))
        .leftJoin(subscriptionCte, eq(subscriptionCte.creatorId, users.id))
        .where(eq(videos.id, id));

      return videoWithUser || null;
    }),
});
