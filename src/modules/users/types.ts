import { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type UserOutput = inferRouterOutputs<AppRouter>["users"]["getOne"];
export type User = UserOutput;
