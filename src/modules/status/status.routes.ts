import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { StatusService } from "./status.service";

export const registerStatusRoutes = (app: FastifyInstance, prisma: PrismaClient): void => {
  const status = new StatusService(prisma);

  app.get("/api/status", async () => status.get());
};
