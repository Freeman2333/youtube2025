import { createTRPCRouter } from "../init";
import { categoriesRouter } from "@/modules/home/server/procedure";

export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
});

export type AppRouter = typeof appRouter;
