import { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type VideoWithUser = NonNullable<
  inferRouterOutputs<AppRouter>["videos"]["getOne"]
>;

export type VideosOutput = inferRouterOutputs<AppRouter>["videos"]["getMany"];
export type Video = VideosOutput["items"][0];
