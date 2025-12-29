import { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type SuggestionsOutput =
  inferRouterOutputs<AppRouter>["suggestions"]["getMany"];
export type SuggestionVideo = SuggestionsOutput["items"][0];
