import { redis } from "./redis";
import { Ratelimit } from "@upstash/ratelimit";

export const ratelimit = new Ratelimit({
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  redis,
});
