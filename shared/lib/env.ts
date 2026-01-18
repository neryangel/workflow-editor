import { z } from "zod";

/**
 * Environment variable validation schema
 * Validates required and optional env vars at build/runtime
 */
const envSchema = z.object({
  // Required in production
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // API Keys (optional for mock mode)
  GEMINI_API_KEY: z.string().optional(),

  // Optional feature flags
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().optional(),
});

// Parse and validate
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  // Don't throw in development to allow gradual setup
  if (process.env.NODE_ENV === "production") {
    throw new Error("Invalid environment variables");
  }
}

export const env = parsed.data ?? {
  NODE_ENV: "development" as const,
  GEMINI_API_KEY: undefined,
  NEXT_PUBLIC_SENTRY_DSN: undefined,
  NEXT_PUBLIC_ENABLE_ANALYTICS: undefined,
};

export type Env = z.infer<typeof envSchema>;
