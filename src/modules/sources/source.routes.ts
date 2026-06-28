import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { SourceService } from "./source.service";

export const registerSourceRoutes = (
  app: FastifyInstance,
  prisma: PrismaClient
): void => {
  const sources = new SourceService(prisma);

  app.get("/api/sources", async () => ({ data: await sources.list() }));

  app.post("/api/sources/reload", async () => sources.reload());
};
