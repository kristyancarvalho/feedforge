export interface NewsSource {
  id: string;
  name: string;
  type: string;
  url: string;
  language: string;
  weight: number;
  tags: string[];
}

export interface Classification {
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

export interface SavedInfo {
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsItem {
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
  source: NewsSource;
  classification: Classification | null;
  saved: SavedInfo | null;
}

export interface NewsCursorResult {
  items: NewsItem[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
}

export interface SourceHealth {
  id: string;
  name: string;
  type: string;
  url: string;
  language: string;
  tags: string[];
  weight: number;
  enabled: boolean;
  lastStatus: string;
  successCount: number;
  failureCount: number;
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  itemsCollected: number;
}

export interface CrawlerRunInfo {
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

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SourceSyncResult {
  total: number;
  created: number;
  updated: number;
}

export interface StatusInfo {
  status: string;
  database: string;
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

export interface NewsFilters {
  q?: string;
  source?: string;
  sourceType?: string;
  topic?: string;
  keyword?: string;
  language?: string;
  status?: string;
  saved?: string;
  minScore?: string;
  maxScore?: string;
  matchStrength?: string;
  publishedFrom?: string;
  publishedTo?: string;
  runId?: string;
  hasSummary?: string;
  hasReasons?: string;
  hasNegativePenalty?: string;
  sort?: string;
  limit?: string;
  cursor?: string;
}

export interface RunFilters {
  trigger?: string;
  status?: string;
  startedFrom?: string;
  startedTo?: string;
  page?: string;
  limit?: string;
}

export const SAVED_STATUSES = [
  "saved",
  "idea",
  "researching",
  "drafting",
  "published",
  "ignored"
] as const;

export type SavedStatus = (typeof SAVED_STATUSES)[number];

export const SORT_OPTIONS = [
  "score_desc",
  "published_desc",
  "published_asc",
  "source_name",
  "freshness_desc",
  "technical_depth_desc",
  "open_source_relevance_desc",
  "negative_penalty_desc",
  "saved_date_desc"
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];
