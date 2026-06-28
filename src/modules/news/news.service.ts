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
  sourceScore: number;
  freshnessScore: number;
  noveltyScore: number;
  negativePenalty: number;
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
    sourceScore: c.sourceScore,
    freshnessScore: c.freshnessScore,
    noveltyScore: c.noveltyScore,
    negativePenalty: c.negativePenalty,
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

const parseMinScore = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseSaved = (value: unknown): boolean | undefined => {
  if (value === "true" || value === true) {
    return true;
  }
  if (value === "false" || value === false) {
    return false;
  }
  return undefined;
};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

export class NewsService {
  private readonly repository: NewsRepository;

  constructor(private readonly prisma: PrismaClient) {
    this.repository = new NewsRepository(prisma);
  }

  async list(query: Record<string, unknown>): Promise<PaginatedResult<NewsDTO>> {
    const filters: NewsFilters = {
      q: asString(query.q),
      source: asString(query.source),
      topic: asString(query.topic),
      language: asString(query.language),
      status: asString(query.status),
      saved: parseSaved(query.saved),
      minScore: parseMinScore(query.minScore),
      sort: asString(query.sort)
    };

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

  async getById(id: string): Promise<NewsDTO> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new AppError("NEWS_ITEM_NOT_FOUND", "News item not found.", 404, { id });
    }
    return serializeNews(item, { includeContent: true });
  }
}
