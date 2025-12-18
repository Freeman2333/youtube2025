import { db } from "@/db";
import { MuxStatus, VideoInsertSchemaStrict, videos, users } from "@/db/schema";
import { mux } from "@/lib/mux";
import {
  createTRPCRouter,
  protectedProcedure,
  baseProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { UTApi } from "uploadthing/server";
import { ensureNoExistingUploadthingFiles } from "@/utils/uploadthing-server";

export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    const upload = await mux.video.uploads.create({
      cors_origin: process.env.NEXT_PUBLIC_APP_BASE_URL!,
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
    .query(async ({ input }) => {
      const { id } = input;

      const [videoWithUser] = await db
        .select({ video: videos, user: users })
        .from(videos)
        .innerJoin(users, eq(users.id, videos.userId))
        .where(eq(videos.id, id));

      return videoWithUser || null;
    }),
});
