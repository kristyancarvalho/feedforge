import { z } from "zod";
import { AppError } from "../shared/errors";

const booleanLike = z
  .union([z.boolean(), z.enum(["true", "false", "1", "0"])])
  .transform((value) => value === true || value === "true" || value === "1");

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  APP_PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SOURCES_FILE: z.string().min(1).default("./sources.json"),
  CRAWLER_USER_AGENT: z.string().min(1).default("FeedForgeBot/0.1"),
  CRAWLER_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  CRAWLER_MAX_CONCURRENT: z.coerce.number().int().positive().default(3),
  CRON_ENABLED: booleanLike.default(true),
  CRON_SCHEDULE: z.string().min(1).default("0 */3 * * *"),
  PUBLIC_APP_NAME: z.string().min(1).default("FeedForge"),
  DEFAULT_MIN_RECOMMENDED_SCORE: z.coerce.number().int().min(0).max(100).default(55)
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export const loadEnv = (source: NodeJS.ProcessEnv = process.env): Env => {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    throw new AppError(
      "VALIDATION_ERROR",
      "Invalid environment configuration.",
      500,
      { fields: details }
    );
  }

  return parsed.data;
};

export const getEnv = (): Env => {
  if (!cached) {
    cached = loadEnv();
  }
  return cached;
};

export const resetEnvCache = (): void => {
  cached = null;
};
