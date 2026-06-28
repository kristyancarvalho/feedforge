import type { PrismaClient } from "@prisma/client";
import { logger } from "../../shared/logger";
import type { SourcesConfig } from "./source.schema";

export interface SourceSyncResult {
  total: number;
  created: number;
  updated: number;
}

export const syncSources = async (
  prisma: PrismaClient,
  config: SourcesConfig
): Promise<SourceSyncResult> => {
  const result: SourceSyncResult = { total: config.sources.length, created: 0, updated: 0 };

  for (const source of config.sources) {
    const existing = await prisma.source.findUnique({ where: { id: source.id } });

    await prisma.source.upsert({
      where: { id: source.id },
      create: {
        id: source.id,
        name: source.name,
        type: source.type,
        url: source.url,
        language: source.language,
        tags: source.tags,
        weight: source.weight,
        enabled: source.enabled
      },
      update: {
        name: source.name,
        type: source.type,
        url: source.url,
        language: source.language,
        tags: source.tags,
        weight: source.weight,
        enabled: source.enabled
      }
    });

    if (existing) {
      result.updated += 1;
    } else {
      result.created += 1;
    }
  }

  logger.info("source sync result", { ...result });
  return result;
};
