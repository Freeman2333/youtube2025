import { db } from "@/db";
import { MuxStatus, videos } from "@/db/schema";
import { mux } from "@/lib/mux";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

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
        userId,
      })
      .returning();

    return { url: upload.url, video };
  }),
});
