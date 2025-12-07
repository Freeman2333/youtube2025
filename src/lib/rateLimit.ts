import { redis } from "./redis";
import { Ratelimit } from "@upstash/ratelimit";

export const ratelimit = new Ratelimit({
  limiter: Ratelimit.slidingWindow(100, "10 s"),
  redis,
});
