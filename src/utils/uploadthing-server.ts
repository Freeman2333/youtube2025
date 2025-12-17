import { db } from "@/db";
import { videos } from "@/db/schema";
import { UTApi } from "uploadthing/server";
import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

type Video = InferSelectModel<typeof videos>;

type VideoUploadKeys = Pick<Video, "id" | "thumbnailKey" | "previewKey">;

export const ensureNoExistingUploadthingFiles = async (
  existingVideo: VideoUploadKeys,
  thumbnailOnly = false
) => {
  const utapi = new UTApi();

  if (!existingVideo) return;

  const updateObject: Partial<Video> = {};

  if (existingVideo.thumbnailKey) {
    await utapi.deleteFiles(existingVideo.thumbnailKey);
    updateObject.thumbnailKey = null;
    updateObject.thumbnailUrl = null;
  }

  if (existingVideo.previewKey && !thumbnailOnly) {
    await utapi.deleteFiles(existingVideo.previewKey);
    updateObject.previewKey = null;
    updateObject.previewUrl = null;
  }

  if (Object.keys(updateObject).length > 0) {
    await db
      .update(videos)
      .set(updateObject)
      .where(eq(videos.id, existingVideo.id));
  }
};
