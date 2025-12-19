import { studioRouter } from "@/modules/studio/server/procedure";
import { createTRPCRouter } from "../init";
import { categoriesRouter } from "@/modules/home/server/procedure";
import { videosRouter } from "@/modules/videos/server/procedure";
import { videoViewsRouter } from "@/modules/video-views/server/procedure";

export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  studio: studioRouter,
  videos: videosRouter,
  videoViews: videoViewsRouter,
});

export type AppRouter = typeof appRouter;
