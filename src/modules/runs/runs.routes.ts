import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { RunsService } from "./runs.service";

export const registerRunsRoutes = (
  app: FastifyInstance,
  prisma: PrismaClient
): void => {
  const runs = new RunsService(prisma);

  app.get("/api/runs", async (request) =>
    runs.list(request.query as Record<string, unknown>)
  );

  app.get("/api/runs/latest", async () => ({ data: await runs.latest() }));
};
