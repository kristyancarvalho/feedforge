import cron, { type ScheduledTask } from "node-cron";
import type { PrismaClient } from "@prisma/client";
import { getEnv } from "../config/env";
import { logger } from "../shared/logger";
import { CrawlerPipelineService } from "../modules/crawler/crawler-pipeline.service";

export const startCrawlerCron = (prisma: PrismaClient): ScheduledTask | null => {
  const env = getEnv();

  if (!env.CRON_ENABLED) {
    logger.info("cron disabled", { schedule: env.CRON_SCHEDULE });
    return null;
  }

  if (!cron.validate(env.CRON_SCHEDULE)) {
    logger.error("invalid cron schedule", { schedule: env.CRON_SCHEDULE });
    return null;
  }

  const pipeline = new CrawlerPipelineService(prisma);

  const task = cron.schedule(env.CRON_SCHEDULE, () => {
    logger.info("cron start", { schedule: env.CRON_SCHEDULE });
    void pipeline
      .run("cron")
      .then((run) => {
        logger.info("cron end", { runId: run.id, status: run.status });
      })
      .catch((error) => {
        logger.error("cron run error", {
          error: error instanceof Error ? error.message : String(error)
        });
      });
  });

  logger.info("cron scheduled", { schedule: env.CRON_SCHEDULE });
  return task;
};
