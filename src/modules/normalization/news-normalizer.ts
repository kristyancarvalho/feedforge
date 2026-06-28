import { resolvePublishedAt } from "../../shared/dates";
import { normalizeWhitespace, stripHtml, truncate } from "../../shared/text";
import type { RawItem } from "../ingestion/ingestion.types";
import type { SourceDefinition } from "../sources/source.schema";
import { generateFingerprint } from "./fingerprint";
import { normalizeUrl } from "./url-normalizer";

export interface NormalizedItem {
  sourceId: string;
  title: string;
  url: string;
  canonicalUrl: string | null;
  normalizedUrl: string;
  author: string | null;
  summary: string | null;
  contentText: string | null;
  language: string;
  publishedAt: Date;
  dateInferred: boolean;
  fingerprint: string;
  rawPayload: Record<string, unknown>;
}

export const normalizeRawItem = (
  item: RawItem,
  source: SourceDefinition,
  now: Date = new Date()
): NormalizedItem | null => {
  const title = normalizeWhitespace(item.title);
  if (!title) {
    return null;
  }

  const { canonicalUrl, normalizedUrl } = normalizeUrl(item.url, source.url);
  if (!normalizedUrl) {
    return null;
  }

  const { date, inferred } = resolvePublishedAt(item.publishedAt, now);

  const summary = item.summary ? truncate(stripHtml(item.summary), 600) : null;
  const contentText = item.contentText ? stripHtml(item.contentText) : null;

  return {
    sourceId: source.id,
    title,
    url: canonicalUrl ?? item.url.trim(),
    canonicalUrl,
    normalizedUrl,
    author: item.author ? normalizeWhitespace(item.author) : null,
    summary,
    contentText,
    language: source.language,
    publishedAt: date,
    dateInferred: inferred,
    fingerprint: generateFingerprint(title, canonicalUrl, source.url),
    rawPayload: item.raw
  };
};
