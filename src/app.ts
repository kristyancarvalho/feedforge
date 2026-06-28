import { existsSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import type { PrismaClient } from "@prisma/client";
import { getEnv } from "./config/env";
import { AppError, toErrorResponse } from "./shared/errors";
import { logger } from "./shared/logger";
import { registerNewsRoutes } from "./modules/news/news.routes";
import { registerSourceRoutes } from "./modules/sources/source.routes";
import { registerRunsRoutes } from "./modules/runs/runs.routes";
import { registerCrawlerRoutes } from "./modules/crawler/crawler.routes";
import { registerStatusRoutes } from "./modules/status/status.routes";

export const buildApp = (prisma: PrismaClient) => {
  const app = Fastify({ logger: false });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send(toErrorResponse(error));
      return;
    }

    logger.error("unhandled request error", {
      error: error instanceof Error ? error.message : String(error)
    });
    reply
      .status(500)
      .send(
        toErrorResponse(
          new AppError("INTERNAL_ERROR", "An unexpected error occurred.", 500)
        )
      );
  });

  app.get("/api/health", async () => {
    let database = "ok";
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      database = "error";
    }
    return {
      status: "ok",
      app: getEnv().PUBLIC_APP_NAME,
      database
    };
  });

  registerSourceRoutes(app, prisma);
  registerNewsRoutes(app, prisma);
  registerRunsRoutes(app, prisma);
  registerCrawlerRoutes(app, prisma);
  registerStatusRoutes(app, prisma);

  const webDist = fileURLToPath(new URL("../web/dist", import.meta.url));

  if (existsSync(webDist)) {
    app.register(fastifyStatic, {
      root: webDist,
      wildcard: false
    });

    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith("/api")) {
        reply
          .status(404)
          .send(toErrorResponse(new AppError("NOT_FOUND", "Resource not found.", 404)));
        return;
      }
      reply.sendFile("index.html");
    });
  } else {
    app.setNotFoundHandler((_request, reply) => {
      reply
        .status(404)
        .send(toErrorResponse(new AppError("NOT_FOUND", "Resource not found.", 404)));
    });
  }

  return app;
};
