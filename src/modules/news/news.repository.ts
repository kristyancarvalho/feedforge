import type { Prisma, PrismaClient } from "@prisma/client";
import type { Pagination } from "../../shared/pagination";

export interface NewsFilters {
  q?: string;
  source?: string;
  topic?: string;
  language?: string;
  status?: string;
  saved?: boolean;
  minScore?: number;
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

  if (filters.language) {
    and.push({ language: filters.language });
  }

  if (filters.topic) {
    and.push({ classification: { detectedTopics: { has: filters.topic } } });
  }

  if (typeof filters.minScore === "number") {
    and.push({ classification: { finalScore: { gte: filters.minScore } } });
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
  if (sort === "recent" || sort === "date" || sort === "newest") {
    return [{ publishedAt: "desc" }];
  }
  if (sort === "oldest") {
    return [{ publishedAt: "asc" }];
  }
  return [{ classification: { finalScore: "desc" } }, { publishedAt: "desc" }];
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

  async findById(id: string): Promise<NewsWithRelations | null> {
    return this.prisma.newsItem.findUnique({
      where: { id },
      include: newsInclude
    });
  }
}
