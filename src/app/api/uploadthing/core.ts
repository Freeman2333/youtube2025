import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { ensureNoExistingUploadthingFiles } from "@/utils/uploadthing-server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import z from "zod";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        videoId: z.uuid(),
      })
    )
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth();

      if (!clerkUserId) throw new UploadThingError({ code: "FORBIDDEN" });

      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, clerkUserId));
      if (!user) throw new UploadThingError({ code: "FORBIDDEN" });

      const [existingVideo] = await db
        .select({
          thumbnailKey: videos.thumbnailKey,
          previewKey: videos.previewKey,
          id: videos.id,
        })
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));

      if (!existingVideo)
        throw new UploadThingError({
          code: "NOT_FOUND",
          message: "Video not found!",
        });

      await ensureNoExistingUploadthingFiles(existingVideo, true);

      return { user, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(videos)
        .set({ thumbnailKey: file.key, thumbnailUrl: file.ufsUrl })
        .where(
          and(
            eq(videos.id, metadata.videoId),
            eq(videos.userId, metadata.user.id)
          )
        )
        .returning();

      return { uploadedBy: metadata.user.id };
    }),
  bannerUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const { userId: clerkUserId } = await auth();

      if (!clerkUserId) throw new UploadThingError({ code: "FORBIDDEN" });

      const [user] = await db
        .select({ id: users.id, bannerUrlKey: users.bannerUrlKey })
        .from(users)
        .where(eq(users.clerkId, clerkUserId));
      if (!user) throw new UploadThingError({ code: "FORBIDDEN" });

      if (user.bannerUrlKey) {
        const utapi = new UTApi();

        await utapi.deleteFiles(user.bannerUrlKey);
        await db
          .update(users)
          .set({ bannerUrl: null, bannerUrlKey: null })
          .where(eq(users.id, user.id));
      }
      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(users)
        .set({ bannerUrl: file.ufsUrl, bannerUrlKey: file.key })
        .where(eq(users.id, metadata.user.id))
        .returning();
      return { uploadedBy: metadata.user.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
