import { buildApp } from "./app";
import { loadEnv } from "./config/env";
import { loadConfiguredSources } from "./config/sources";
import { startCrawlerCron } from "./jobs/crawler-cron";
import { syncSources } from "./modules/sources/source-sync.service";
import { getPrisma, disconnectPrisma } from "./shared/prisma";
import { logger } from "./shared/logger";

const start = async () => {
  const env = loadEnv();
  logger.info("app startup", { name: env.PUBLIC_APP_NAME, env: env.NODE_ENV });

  const prisma = getPrisma();

  try {
    await prisma.$connect();
    logger.info("database connection", { status: "ok" });
  } catch (error) {
    logger.error("database connection failed", { error: String(error) });
    process.exit(1);
  }

  try {
    const config = await loadConfiguredSources();
    const result = await syncSources(prisma, config);
    logger.info("startup source sync", { ...result });
  } catch (error) {
    logger.error("startup source sync failed", { error: String(error) });
    process.exit(1);
  }

  const app = buildApp(prisma);

  try {
    await app.listen({ port: env.APP_PORT, host: "0.0.0.0" });
    logger.info("app started", { port: env.APP_PORT });
  } catch (error) {
    logger.error("app failed to start", { error: String(error) });
    process.exit(1);
  }

  startCrawlerCron(prisma);

  const shutdown = async (signal: string) => {
    logger.info("app shutdown", { signal });
    await app.close();
    await disconnectPrisma();
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
};

void start();
