import type { Prisma, PrismaClient } from "@prisma/client";
import type { Pagination } from "../../shared/pagination";

export interface NewsFilters {
  q?: string;
  source?: string;
  sourceType?: string;
  topic?: string;
  keyword?: string;
  language?: string;
  status?: string;
  saved?: boolean;
  minScore?: number;
  maxScore?: number;
  matchStrength?: string;
  publishedFrom?: Date;
  publishedTo?: Date;
  runId?: string;
  hasSummary?: boolean;
  hasReasons?: boolean;
  hasNegativePenalty?: boolean;
  sort?: string;
}

export const newsInclude = {
  source: true,
  classification: true,
  savedNews: true
} satisfies Prisma.NewsItemInclude;

export type NewsWithRelations = Prisma.NewsItemGetPayload<{ include: typeof newsInclude }>;

const buildWhere = (filters: NewsFilters): Prisma.NewsItemWhereInput => {
  const where: Prisma.NewsItemWhereInput = {};
  const and: Prisma.NewsItemWhereInput[] = [];

  if (filters.q) {
    and.push({
      OR: [
        { title: { contains: filters.q, mode: "insensitive" } },
        { summary: { contains: filters.q, mode: "insensitive" } }
      ]
    });
  }

  if (filters.source) {
    and.push({ sourceId: filters.source });
  }

  if (filters.sourceType) {
    and.push({ source: { type: filters.sourceType } });
  }

  if (filters.language) {
    and.push({ language: filters.language });
  }

  if (filters.topic) {
    and.push({ classification: { detectedTopics: { has: filters.topic } } });
  }

  if (filters.keyword) {
    and.push({ classification: { matchedKeywords: { has: filters.keyword } } });
  }

  if (typeof filters.minScore === "number") {
    and.push({ classification: { finalScore: { gte: filters.minScore } } });
  }

  if (typeof filters.maxScore === "number") {
    and.push({ classification: { finalScore: { lte: filters.maxScore } } });
  }

  if (filters.matchStrength) {
    and.push({ classification: { matchStrength: filters.matchStrength } });
  }

  if (filters.hasNegativePenalty === true) {
    and.push({ classification: { negativePenalty: { gt: 0 } } });
  } else if (filters.hasNegativePenalty === false) {
    and.push({ classification: { negativePenalty: { lte: 0 } } });
  }

  if (filters.hasReasons === true) {
    and.push({ classification: { reasons: { isEmpty: false } } });
  } else if (filters.hasReasons === false) {
    and.push({ classification: { reasons: { isEmpty: true } } });
  }

  if (filters.hasSummary === true) {
    and.push({ summary: { not: null } });
    and.push({ NOT: { summary: "" } });
  } else if (filters.hasSummary === false) {
    and.push({ OR: [{ summary: null }, { summary: "" }] });
  }

  if (filters.publishedFrom) {
    and.push({ publishedAt: { gte: filters.publishedFrom } });
  }

  if (filters.publishedTo) {
    and.push({ publishedAt: { lte: filters.publishedTo } });
  }

  if (filters.runId) {
    and.push({ lastSeenRunId: filters.runId });
  }

  if (filters.status) {
    and.push({ savedNews: { status: filters.status } });
  }

  if (filters.saved === true) {
    and.push({ savedNews: { isNot: null } });
  } else if (filters.saved === false) {
    and.push({ savedNews: { is: null } });
  }

  if (and.length > 0) {
    where.AND = and;
  }

  return where;
};

const buildOrderBy = (sort?: string): Prisma.NewsItemOrderByWithRelationInput[] => {
  const tiebreaker: Prisma.NewsItemOrderByWithRelationInput = { id: "desc" };

  switch (sort) {
    case "published_desc":
    case "recent":
    case "date":
    case "newest":
      return [{ publishedAt: "desc" }, tiebreaker];
    case "published_asc":
    case "oldest":
      return [{ publishedAt: "asc" }, tiebreaker];
    case "source_name":
      return [{ source: { name: "asc" } }, tiebreaker];
    case "freshness_desc":
      return [{ classification: { freshnessScore: "desc" } }, tiebreaker];
    case "technical_depth_desc":
      return [{ classification: { technicalDepthScore: "desc" } }, tiebreaker];
    case "open_source_relevance_desc":
      return [{ classification: { openSourceRelevanceScore: "desc" } }, tiebreaker];
    case "negative_penalty_desc":
      return [{ classification: { negativePenalty: "desc" } }, tiebreaker];
    case "saved_date_desc":
      return [{ savedNews: { createdAt: "desc" } }, tiebreaker];
    case "score":
    default:
      return [{ classification: { finalScore: "desc" } }, { publishedAt: "desc" }, tiebreaker];
  }
};

export interface CursorPage {
  items: NewsWithRelations[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
}

const parseOffset = (cursor?: string): number => {
  if (!cursor) {
    return 0;
  }
  const parsed = Number.parseInt(cursor, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export class NewsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    filters: NewsFilters,
    pagination: Pagination
  ): Promise<{ items: NewsWithRelations[]; total: number }> {
    const where = buildWhere(filters);

    const [items, total] = await Promise.all([
      this.prisma.newsItem.findMany({
        where,
        include: newsInclude,
        orderBy: buildOrderBy(filters.sort),
        skip: pagination.skip,
        take: pagination.limit
      }),
      this.prisma.newsItem.count({ where })
    ]);

    return { items, total };
  }

  async listCursor(
    filters: NewsFilters,
    limit: number,
    cursor?: string
  ): Promise<CursorPage> {
    const where = buildWhere(filters);
    const offset = parseOffset(cursor);

    const [items, total] = await Promise.all([
      this.prisma.newsItem.findMany({
        where,
        include: newsInclude,
        orderBy: buildOrderBy(filters.sort),
        skip: offset,
        take: limit + 1
      }),
      this.prisma.newsItem.count({ where })
    ]);

    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? String(offset + limit) : null;

    return { items: page, nextCursor, hasMore, total };
  }

  async findById(id: string): Promise<NewsWithRelations | null> {
    return this.prisma.newsItem.findUnique({
      where: { id },
      include: newsInclude
    });
  }
}
