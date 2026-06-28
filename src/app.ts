import { existsSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { AppError, toErrorResponse } from "./shared/errors";

export const buildApp = () => {
  const app = Fastify({ logger: false });

  app.get("/api/health", async () => ({
    status: "ok",
    app: process.env.PUBLIC_APP_NAME ?? "FeedForge",
    database: "ok"
  }));

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
  }

  return app;
};
