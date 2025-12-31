import { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type SearchOutput = inferRouterOutputs<AppRouter>["search"]["getMany"];
export type SearchVideo = SearchOutput["items"][0];
