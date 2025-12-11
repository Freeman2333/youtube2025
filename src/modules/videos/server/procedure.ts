import { db } from "@/db";
import { MuxStatus, VideoInsertSchemaStrict, videos } from "@/db/schema";
import { mux } from "@/lib/mux";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

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
});
