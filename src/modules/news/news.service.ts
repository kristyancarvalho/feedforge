import type { PrismaClient } from "@prisma/client";
import { AppError } from "../../shared/errors";
import {
  buildPaginatedResult,
  resolvePagination,
  type PaginatedResult
} from "../../shared/pagination";
import { truncate } from "../../shared/text";
import { NewsRepository, type NewsFilters, type NewsWithRelations } from "./news.repository";

export interface NewsSourceDTO {
  id: string;
  name: string;
  type: string;
  url: string;
  language: string;
  weight: number;
  tags: string[];
}

export interface ClassificationDTO {
  finalScore: number;
  topicScore: number;
  keywordScore: number;
  technicalDepthScore: number;
  openSourceRelevanceScore: number;
  sourceScore: number;
  freshnessScore: number;
  noveltyScore: number;
  negativePenalty: number;
  matchStrength: string;
  detectedTopics: string[];
  matchedKeywords: string[];
  reasons: string[];
}

export interface SavedDTO {
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsDTO {
  id: string;
  title: string;
  url: string;
  canonicalUrl: string | null;
  summary: string | null;
  contentExcerpt: string | null;
  author: string | null;
  language: string;
  publishedAt: string | null;
  dateInferred: boolean;
  createdAt: string;
  source: NewsSourceDTO;
  classification: ClassificationDTO | null;
  saved: SavedDTO | null;
}

const toClassificationDTO = (
  item: NewsWithRelations
): ClassificationDTO | null => {
  if (!item.classification) {
    return null;
  }
  const c = item.classification;
  return {
    finalScore: c.finalScore,
    topicScore: c.topicScore,
    keywordScore: c.keywordScore,
    technicalDepthScore: c.technicalDepthScore,
    openSourceRelevanceScore: c.openSourceRelevanceScore,
    sourceScore: c.sourceScore,
    freshnessScore: c.freshnessScore,
    noveltyScore: c.noveltyScore,
    negativePenalty: c.negativePenalty,
    matchStrength: c.matchStrength,
    detectedTopics: c.detectedTopics,
    matchedKeywords: c.matchedKeywords,
    reasons: c.reasons
  };
};

const toSavedDTO = (item: NewsWithRelations): SavedDTO | null => {
  if (!item.savedNews) {
    return null;
  }
  return {
    status: item.savedNews.status,
    notes: item.savedNews.notes,
    createdAt: item.savedNews.createdAt.toISOString(),
    updatedAt: item.savedNews.updatedAt.toISOString()
  };
};

export const serializeNews = (
  item: NewsWithRelations,
  options: { includeContent?: boolean } = {}
): NewsDTO => ({
  id: item.id,
  title: item.title,
  url: item.url,
  canonicalUrl: item.canonicalUrl,
  summary: item.summary,
  contentExcerpt: options.includeContent && item.contentText
    ? truncate(item.contentText, 1200)
    : null,
  author: item.author,
  language: item.language,
  publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
  dateInferred: item.dateInferred,
  createdAt: item.createdAt.toISOString(),
  source: {
    id: item.source.id,
    name: item.source.name,
    type: item.source.type,
    url: item.source.url,
    language: item.source.language,
    weight: item.source.weight,
    tags: item.source.tags
  },
  classification: toClassificationDTO(item),
  saved: toSavedDTO(item)
});

const parseScore = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseBoolean = (value: unknown): boolean | undefined => {
  if (value === "true" || value === true) {
    return true;
  }
  if (value === "false" || value === false) {
    return false;
  }
  return undefined;
};

const parseDate = (value: unknown): Date | undefined => {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

const parseLimit = (value: unknown, fallback: number, max: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(Math.floor(parsed), max);
};

export const buildNewsFilters = (query: Record<string, unknown>): NewsFilters => ({
  q: asString(query.q),
  source: asString(query.source),
  sourceType: asString(query.sourceType),
  topic: asString(query.topic),
  keyword: asString(query.keyword),
  language: asString(query.language),
  status: asString(query.status),
  saved: parseBoolean(query.saved),
  minScore: parseScore(query.minScore),
  maxScore: parseScore(query.maxScore),
  matchStrength: asString(query.matchStrength),
  publishedFrom: parseDate(query.publishedFrom),
  publishedTo: parseDate(query.publishedTo),
  runId: asString(query.runId),
  hasSummary: parseBoolean(query.hasSummary),
  hasReasons: parseBoolean(query.hasReasons),
  hasNegativePenalty: parseBoolean(query.hasNegativePenalty),
  sort: asString(query.sort)
});

export interface NewsCursorResult {
  items: NewsDTO[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
}

export class NewsService {
  private readonly repository: NewsRepository;

  constructor(private readonly prisma: PrismaClient) {
    this.repository = new NewsRepository(prisma);
  }

  async list(query: Record<string, unknown>): Promise<PaginatedResult<NewsDTO>> {
    const filters = buildNewsFilters(query);

    const pagination = resolvePagination({
      page: query.page as string,
      limit: query.limit as string
    });

    const { items, total } = await this.repository.list(filters, pagination);
    return buildPaginatedResult(
      items.map((item) => serializeNews(item)),
      total,
      pagination
    );
  }

  async listCursor(query: Record<string, unknown>): Promise<NewsCursorResult> {
    const filters = buildNewsFilters(query);
    const limit = parseLimit(query.limit, 24, 60);
    const cursor = asString(query.cursor);

    const page = await this.repository.listCursor(filters, limit, cursor);
    return {
      items: page.items.map((item) => serializeNews(item)),
      nextCursor: page.nextCursor,
      hasMore: page.hasMore,
      total: page.total
    };
  }

  async getById(id: string): Promise<NewsDTO> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new AppError("NEWS_ITEM_NOT_FOUND", "News item not found.", 404, { id });
    }
    return serializeNews(item, { includeContent: true });
  }
}
