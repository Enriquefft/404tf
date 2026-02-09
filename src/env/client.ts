import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const clientEnv = createEnv({
    client: {
        NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
        NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
        NEXT_PUBLIC_PROJECT_NAME: z.string(),
    },
    runtimeEnv: {
        NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
        NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        NEXT_PUBLIC_PROJECT_NAME: process.env["NEXT_PUBLIC_PROJECT_NAME"],
    },
    server: {},
    emptyStringAsUndefined: true,
});
