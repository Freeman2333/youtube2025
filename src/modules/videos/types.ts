import { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type VideoWithUser = NonNullable<
  inferRouterOutputs<AppRouter>["videos"]["getOne"]
>;
