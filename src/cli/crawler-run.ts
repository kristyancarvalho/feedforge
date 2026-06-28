import { getPrisma, disconnectPrisma } from "../shared/prisma";
import { logger } from "../shared/logger";
import { CrawlerPipelineService } from "../modules/crawler/crawler-pipeline.service";

const main = async (): Promise<void> => {
  const prisma = getPrisma();
  const pipeline = new CrawlerPipelineService(prisma);

  try {
    const run = await pipeline.run("manual");
    logger.info("manual run end", { runId: run.id, status: run.status });
  } finally {
    await disconnectPrisma();
  }
};

void main().catch((error) => {
  logger.error("manual run error", {
    error: error instanceof Error ? error.message : String(error)
  });
  process.exit(1);
});
