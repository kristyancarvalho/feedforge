import { describe, expect, it } from "vitest";
import { AppError } from "../shared/errors";
import { loadEnv } from "./env";

const baseEnv = {
  DATABASE_URL: "postgresql://feedforge:feedforge@db:5432/feedforge"
};

describe("environment validation", () => {
  it("applies safe defaults for optional values", () => {
    const env = loadEnv(baseEnv as NodeJS.ProcessEnv);
    expect(env.APP_PORT).toBe(3000);
    expect(env.NODE_ENV).toBe("development");
    expect(env.SOURCES_FILE).toBe("./sources.json");
    expect(env.CRAWLER_TIMEOUT_MS).toBe(15000);
    expect(env.CRAWLER_MAX_CONCURRENT).toBe(3);
    expect(env.CRON_ENABLED).toBe(true);
    expect(env.PUBLIC_APP_NAME).toBe("FeedForge");
  });

  it("coerces numeric and boolean values", () => {
    const env = loadEnv({
      ...baseEnv,
      APP_PORT: "8080",
      CRAWLER_TIMEOUT_MS: "5000",
      CRON_ENABLED: "false"
    } as NodeJS.ProcessEnv);
    expect(env.APP_PORT).toBe(8080);
    expect(env.CRAWLER_TIMEOUT_MS).toBe(5000);
    expect(env.CRON_ENABLED).toBe(false);
  });

  it("fails when DATABASE_URL is missing", () => {
    expect(() => loadEnv({} as NodeJS.ProcessEnv)).toThrow(AppError);
  });

  it("fails when APP_PORT is not numeric", () => {
    try {
      loadEnv({ ...baseEnv, APP_PORT: "abc" } as NodeJS.ProcessEnv);
      expect.unreachable("loadEnv should throw");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("VALIDATION_ERROR");
    }
  });
});
