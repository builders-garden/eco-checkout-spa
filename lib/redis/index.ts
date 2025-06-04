import { Redis } from "@upstash/redis";
import { env } from "../zod";

export const redisClient = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});
