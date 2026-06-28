export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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
  sourceScore: number;
  freshnessScore: number;
  noveltyScore: number;
  negativePenalty: number;
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

export interface SourceHealth {
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

export interface SourceSyncResult {
  total: number;
  created: number;
  updated: number;
}

export interface NewsFilters {
  q?: string;
  source?: string;
  topic?: string;
  language?: string;
  status?: string;
  saved?: string;
  minScore?: string;
  sort?: string;
  page?: number;
  limit?: number;
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
