import type { PrismaClient, Source } from "@prisma/client";
import { AppError } from "../../shared/errors";
import { logger } from "../../shared/logger";
import { loadConfiguredSources } from "../../config/sources";
import { syncSources, type SourceSyncResult } from "./source-sync.service";

export interface SourceDTO {
  id: string;
  name: string;
  type: string;
  url: string;
  language: string;
  tags: string[];
  weight: number;
  enabled: boolean;
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  itemsCollected: number;
}

const serializeSource = (source: Source, itemsCollected: number): SourceDTO => ({
  id: source.id,
  name: source.name,
  type: source.type,
  url: source.url,
  language: source.language,
  tags: source.tags,
  weight: source.weight,
  enabled: source.enabled,
  lastRunAt: source.lastRunAt ? source.lastRunAt.toISOString() : null,
  lastSuccessAt: source.lastSuccessAt ? source.lastSuccessAt.toISOString() : null,
  lastError: source.lastError,
  itemsCollected
});

export class SourceService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(): Promise<SourceDTO[]> {
    const sources = await this.prisma.source.findMany({
      orderBy: [{ enabled: "desc" }, { name: "asc" }]
    });

    const counts = await this.prisma.newsItem.groupBy({
      by: ["sourceId"],
      _count: { _all: true }
    });

    const countById = new Map(counts.map((entry) => [entry.sourceId, entry._count._all]));

    return sources.map((source) => serializeSource(source, countById.get(source.id) ?? 0));
  }

  async reload(): Promise<SourceSyncResult> {
    try {
      const config = await loadConfiguredSources();
      const result = await syncSources(this.prisma, config);
      logger.info("source reload result", { ...result });
      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw new AppError("SOURCE_RELOAD_FAILED", error.message, 400, error.details);
      }
      throw new AppError(
        "SOURCE_RELOAD_FAILED",
        "Failed to reload sources.",
        400,
        { cause: error instanceof Error ? error.message : String(error) }
      );
    }
  }
}
