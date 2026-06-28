import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { serializeRun } from "../runs/runs.service";
import { CrawlerPipelineService } from "./crawler-pipeline.service";

export const registerCrawlerRoutes = (
  app: FastifyInstance,
  prisma: PrismaClient
): void => {
  const pipeline = new CrawlerPipelineService(prisma);

  app.post("/api/crawler/run", async () => {
    const run = await pipeline.run("manual");
    return { data: serializeRun(run) };
  });
};
