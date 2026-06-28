import type { CrawlerRun, PrismaClient } from "@prisma/client";
import { loadConfiguredSources } from "../../config/sources";
import { getEnv } from "../../config/env";
import { mapWithConcurrency } from "../../shared/concurrency";
import { AppError } from "../../shared/errors";
import { logger } from "../../shared/logger";
import { ClassifierService } from "../classification/classifier.service";
import { DeduplicationService } from "../deduplication/deduplication.service";
import { crawlSource } from "../ingestion/crawl-source";
import type { SourceCrawlResult } from "../ingestion/ingestion.types";
import { normalizeRawItem, type NormalizedItem } from "../normalization/news-normalizer";
import { syncSources } from "../sources/source-sync.service";
import type { SourceDefinition, SourcesConfig } from "../sources/source.schema";
import { crawlerLock, type CrawlerLock } from "./crawler-lock.service";
import { calculateRunStatus, type RunTrigger } from "./run-status";

export class CrawlerPipelineService {
  private readonly dedup: DeduplicationService;
  private readonly classifier: ClassifierService;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly lock: CrawlerLock = crawlerLock
  ) {
    this.dedup = new DeduplicationService(prisma);
    this.classifier = new ClassifierService(prisma);
  }

  async run(trigger: RunTrigger): Promise<CrawlerRun> {
    if (!this.lock.tryAcquire()) {
      if (trigger === "manual") {
        throw new AppError(
          "CRAWLER_ALREADY_RUNNING",
          "A crawler run is already active.",
          409
        );
      }

      logger.warn("crawler run skipped", { trigger });
      return this.prisma.crawlerRun.create({
        data: {
          trigger,
          status: "skipped",
          finishedAt: new Date(),
          errorMessage: "Another crawler run is already active."
        }
      });
    }

    const run = await this.prisma.crawlerRun.create({
      data: { trigger, status: "running" }
    });

    logger.info("crawler run start", { runId: run.id, trigger });

    try {
      const result = await this.execute(run, trigger);
      logger.info("crawler run finish", {
        runId: run.id,
        status: result.status,
        itemsCreated: result.itemsCreated,
        itemsUpdated: result.itemsUpdated
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("crawler run failed", { runId: run.id, error: message });
      return this.prisma.crawlerRun.update({
        where: { id: run.id },
        data: { status: "failed", finishedAt: new Date(), errorMessage: message }
      });
    } finally {
      this.lock.release();
    }
  }

  private async execute(run: CrawlerRun, _trigger: RunTrigger): Promise<CrawlerRun> {
    const env = getEnv();
    const config = await this.loadAndSync();

    const enabledSources = config.sources.filter((source) => source.enabled);
    const now = new Date();

    const crawlResults = await mapWithConcurrency(
      enabledSources,
      env.CRAWLER_MAX_CONCURRENT,
      (source) =>
        crawlSource(source, {
          userAgent: env.CRAWLER_USER_AGENT,
          timeoutMs: env.CRAWLER_TIMEOUT_MS
        })
    );

    await this.updateSourceStatus(enabledSources, crawlResults, now);

    const normalized = this.normalize(enabledSources, crawlResults, now);
    const persistResult = await this.dedup.persist(normalized);

    if (persistResult.affectedNewsItemIds.length > 0) {
      await this.prisma.newsItem.updateMany({
        where: { id: { in: persistResult.affectedNewsItemIds } },
        data: { lastSeenRunId: run.id }
      });
    }

    await this.classifier.classifyNewsItems(
      persistResult.affectedNewsItemIds,
      config.editorialProfile,
      now
    );

    const successfulSources = crawlResults.filter((result) => result.ok).length;
    const failedSources = crawlResults.filter((result) => !result.ok).length;
    const itemsFound = crawlResults.reduce((total, result) => total + result.items.length, 0);
    const status = calculateRunStatus(
      enabledSources.length,
      successfulSources,
      failedSources
    );

    return this.prisma.crawlerRun.update({
      where: { id: run.id },
      data: {
        status,
        finishedAt: new Date(),
        totalSources: enabledSources.length,
        successfulSources,
        failedSources,
        itemsFound,
        itemsCreated: persistResult.created,
        itemsUpdated: persistResult.updated,
        itemsSkipped: persistResult.skipped
      }
    });
  }

  private async loadAndSync(): Promise<SourcesConfig> {
    const config = await loadConfiguredSources();
    await syncSources(this.prisma, config);
    return config;
  }

  private normalize(
    sources: SourceDefinition[],
    crawlResults: SourceCrawlResult[],
    now: Date
  ): NormalizedItem[] {
    const sourceById = new Map(sources.map((source) => [source.id, source]));
    const normalized: NormalizedItem[] = [];

    for (const result of crawlResults) {
      const source = sourceById.get(result.sourceId);
      if (!source) {
        continue;
      }
      for (const rawItem of result.items) {
        const item = normalizeRawItem(rawItem, source, now);
        if (item) {
          normalized.push(item);
        }
      }
    }

    return normalized;
  }

  private async updateSourceStatus(
    sources: SourceDefinition[],
    crawlResults: SourceCrawlResult[],
    now: Date
  ): Promise<void> {
    const resultById = new Map(crawlResults.map((result) => [result.sourceId, result]));

    for (const source of sources) {
      const result = resultById.get(source.id);
      if (!result) {
        continue;
      }

      await this.prisma.source.update({
        where: { id: source.id },
        data: {
          lastRunAt: now,
          lastStatus: result.ok ? "healthy" : "failing",
          ...(result.ok
            ? { lastSuccessAt: now, lastError: null, successCount: { increment: 1 } }
            : { lastError: result.error, failureCount: { increment: 1 } })
        }
      });
    }
  }
}
