import type { PrismaClient } from "@prisma/client";
import { getEnv } from "../../config/env";
import { crawlerLock, type CrawlerLock } from "../crawler/crawler-lock.service";

export type OperationalStatus =
  | "operational"
  | "degraded"
  | "running"
  | "offline"
  | "unknown";

export interface StatusDTO {
  status: OperationalStatus;
  database: "ok" | "error";
  recommendedMinScore: number;
  crawler: {
    active: boolean;
    latestRunStatus: string | null;
    latestRunAt: string | null;
  };
  sources: {
    total: number;
    healthy: number;
    failing: number;
  };
  cron: {
    enabled: boolean;
    schedule: string;
  };
}

export const resolveOperationalStatus = (
  active: boolean,
  latestRunStatus: string | null,
  failing: number,
  total: number
): OperationalStatus => {
  if (active) {
    return "running";
  }
  if (total === 0 || latestRunStatus === null) {
    return "unknown";
  }
  if (latestRunStatus === "failed") {
    return "offline";
  }
  if (failing > 0 || latestRunStatus === "partial_success") {
    return "degraded";
  }
  return "operational";
};

export class StatusService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly lock: CrawlerLock = crawlerLock
  ) {}

  async get(): Promise<StatusDTO> {
    const env = getEnv();
    const active = this.lock.isActive();

    let database: "ok" | "error" = "ok";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = "error";
    }

    if (database === "error") {
      return {
        status: "offline",
        database,
        recommendedMinScore: env.DEFAULT_MIN_RECOMMENDED_SCORE,
        crawler: { active, latestRunStatus: null, latestRunAt: null },
        sources: { total: 0, healthy: 0, failing: 0 },
        cron: { enabled: env.CRON_ENABLED, schedule: env.CRON_SCHEDULE }
      };
    }

    const [latestRun, total, failing, enabledTotal] = await Promise.all([
      this.prisma.crawlerRun.findFirst({ orderBy: { startedAt: "desc" } }),
      this.prisma.source.count({ where: { enabled: true } }),
      this.prisma.source.count({ where: { enabled: true, lastStatus: "failing" } }),
      this.prisma.source.count({ where: { enabled: true } })
    ]);

    const healthy = enabledTotal - failing;
    const latestRunStatus = latestRun ? latestRun.status : null;
    const latestRunAt = latestRun ? latestRun.startedAt.toISOString() : null;

    const status = resolveOperationalStatus(active, latestRunStatus, failing, total);

    return {
      status,
      database,
      recommendedMinScore: env.DEFAULT_MIN_RECOMMENDED_SCORE,
      crawler: { active, latestRunStatus, latestRunAt },
      sources: { total, healthy, failing },
      cron: { enabled: env.CRON_ENABLED, schedule: env.CRON_SCHEDULE }
    };
  }
}
