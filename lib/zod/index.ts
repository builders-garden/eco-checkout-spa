import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // REDIS
    UPSTASH_REDIS_REST_URL: z.string().min(1),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  },
  client: {
    // REOWN App ID
    NEXT_PUBLIC_REOWN_APP_ID: z.string().min(1),

    // RELAYOOR BASE URL
    NEXT_PUBLIC_RELAYOOR_BASE_URL: z.string().min(1),

    // APP BASE URL
    NEXT_PUBLIC_APP_BASE_URL: z.string().min(1),

    // ALCHEMY API KEY
    NEXT_PUBLIC_ALCHEMY_API_KEY: z.string().min(1).optional(),

    // ECO DAPP ID
    NEXT_PUBLIC_ECO_DAPP_ID: z.string().min(1),
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {
    NEXT_PUBLIC_REOWN_APP_ID: process.env.NEXT_PUBLIC_REOWN_APP_ID,
    NEXT_PUBLIC_RELAYOOR_BASE_URL: process.env.NEXT_PUBLIC_RELAYOOR_BASE_URL,
    NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
    NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    NEXT_PUBLIC_ECO_DAPP_ID: process.env.NEXT_PUBLIC_ECO_DAPP_ID,
  },
});
