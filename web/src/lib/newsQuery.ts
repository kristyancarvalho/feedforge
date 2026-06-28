import type { NewsFilters } from "../api/types";

export const NEWS_FILTER_KEYS = [
  "q",
  "source",
  "sourceType",
  "topic",
  "keyword",
  "language",
  "status",
  "saved",
  "minScore",
  "maxScore",
  "matchStrength",
  "publishedFrom",
  "publishedTo",
  "runId",
  "hasSummary",
  "hasReasons",
  "hasNegativePenalty",
  "sort"
] as const;

export type NewsFilterKey = (typeof NEWS_FILTER_KEYS)[number];

export function paramsToNewsFilters(params: URLSearchParams): NewsFilters {
  const filters: NewsFilters = {};
  for (const key of NEWS_FILTER_KEYS) {
    const value = params.get(key);
    if (value !== null && value !== "") {
      filters[key] = value;
    }
  }
  return filters;
}

export function activeFilterCount(params: URLSearchParams, ignore: NewsFilterKey[] = []): number {
  let count = 0;
  for (const key of NEWS_FILTER_KEYS) {
    if (ignore.includes(key)) continue;
    const value = params.get(key);
    if (value !== null && value !== "") count += 1;
  }
  return count;
}
