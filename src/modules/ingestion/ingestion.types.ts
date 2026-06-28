import type { SourceLanguage } from "../sources/source.schema";

export interface RawItem {
  sourceId: string;
  title: string;
  url: string;
  summary: string | null;
  contentText: string | null;
  author: string | null;
  publishedAt: string | null;
  language: SourceLanguage;
  raw: Record<string, unknown>;
}

export interface SourceCrawlResult {
  sourceId: string;
  ok: boolean;
  items: RawItem[];
  error: string | null;
}

export interface CrawlOptions {
  userAgent: string;
  timeoutMs: number;
}
