import type { CrawlerRun, PrismaClient } from "@prisma/client";
import {
  buildPaginatedResult,
  resolvePagination,
  type PaginatedResult
} from "../../shared/pagination";

export interface RunDTO {
  id: string;
  trigger: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  totalSources: number;
  successfulSources: number;
  failedSources: number;
  itemsFound: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsSkipped: number;
  errorMessage: string | null;
}

export const serializeRun = (run: CrawlerRun): RunDTO => ({
  id: run.id,
  trigger: run.trigger,
  status: run.status,
  startedAt: run.startedAt.toISOString(),
  finishedAt: run.finishedAt ? run.finishedAt.toISOString() : null,
  durationMs: run.finishedAt
    ? run.finishedAt.getTime() - run.startedAt.getTime()
    : null,
  totalSources: run.totalSources,
  successfulSources: run.successfulSources,
  failedSources: run.failedSources,
  itemsFound: run.itemsFound,
  itemsCreated: run.itemsCreated,
  itemsUpdated: run.itemsUpdated,
  itemsSkipped: run.itemsSkipped,
  errorMessage: run.errorMessage
});

export class RunsService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(query: Record<string, unknown>): Promise<PaginatedResult<RunDTO>> {
    const pagination = resolvePagination({
      page: query.page as string,
      limit: query.limit as string
    });

    const [runs, total] = await Promise.all([
      this.prisma.crawlerRun.findMany({
        orderBy: { startedAt: "desc" },
        skip: pagination.skip,
        take: pagination.limit
      }),
      this.prisma.crawlerRun.count()
    ]);

    return buildPaginatedResult(runs.map(serializeRun), total, pagination);
  }

  async latest(): Promise<RunDTO | null> {
    const run = await this.prisma.crawlerRun.findFirst({
      orderBy: { startedAt: "desc" }
    });
    return run ? serializeRun(run) : null;
  }
}
