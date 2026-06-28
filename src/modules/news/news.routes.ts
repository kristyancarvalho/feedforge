import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { NewsService } from "./news.service";
import { SavedNewsService } from "../saved-news/saved-news.service";

interface IdParams {
  id: string;
}

interface StatusBody {
  status?: unknown;
  notes?: unknown;
}

export const registerNewsRoutes = (app: FastifyInstance, prisma: PrismaClient): void => {
  const news = new NewsService(prisma);
  const saved = new SavedNewsService(prisma);

  app.get("/api/news", async (request) =>
    news.listCursor(request.query as Record<string, unknown>)
  );

  app.get<{ Params: IdParams }>("/api/news/:id", async (request) =>
    news.getById(request.params.id)
  );

  app.post<{ Params: IdParams }>("/api/news/:id/save", async (request) =>
    saved.save(request.params.id)
  );

  app.delete<{ Params: IdParams }>("/api/news/:id/save", async (request) =>
    saved.unsave(request.params.id)
  );

  app.patch<{ Params: IdParams; Body: StatusBody }>(
    "/api/news/:id/status",
    async (request) => {
      const body = request.body ?? {};
      return saved.updateStatus(request.params.id, body.status, body.notes);
    }
  );
};
