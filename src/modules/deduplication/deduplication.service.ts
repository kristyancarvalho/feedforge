import type { PrismaClient } from "@prisma/client";
import { titleSimilarity } from "../../shared/text";
import type { NormalizedItem } from "../normalization/news-normalizer";

export const TITLE_SIMILARITY_THRESHOLD = 0.85;

export interface ComparableItem {
  canonicalUrl: string | null;
  normalizedUrl: string;
  fingerprint: string;
  sourceId: string;
  title: string;
}

export const isDuplicate = (a: ComparableItem, b: ComparableItem): boolean => {
  if (a.canonicalUrl && b.canonicalUrl && a.canonicalUrl === b.canonicalUrl) {
    return true;
  }
  if (a.normalizedUrl && b.normalizedUrl && a.normalizedUrl === b.normalizedUrl) {
    return true;
  }
  if (a.fingerprint === b.fingerprint) {
    return true;
  }
  if (
    a.sourceId === b.sourceId &&
    titleSimilarity(a.title, b.title) >= TITLE_SIMILARITY_THRESHOLD
  ) {
    return true;
  }
  return false;
};

export const dedupeBatch = <T extends ComparableItem>(items: T[]): T[] => {
  const unique: T[] = [];
  for (const item of items) {
    if (!unique.some((existing) => isDuplicate(item, existing))) {
      unique.push(item);
    }
  }
  return unique;
};

export interface PersistResult {
  found: number;
  created: number;
  updated: number;
  skipped: number;
  affectedNewsItemIds: string[];
}

interface ExistingNewsItem {
  id: string;
  title: string;
  canonicalUrl: string | null;
  normalizedUrl: string | null;
  fingerprint: string;
  sourceId: string;
  summary: string | null;
  contentText: string | null;
  author: string | null;
  publishedAt: Date | null;
  dateInferred: boolean;
}

const buildUpdateData = (
  existing: ExistingNewsItem,
  candidate: NormalizedItem
): Record<string, unknown> => {
  const data: Record<string, unknown> = {};

  if (!existing.summary && candidate.summary) {
    data.summary = candidate.summary;
  }
  if (!existing.contentText && candidate.contentText) {
    data.contentText = candidate.contentText;
  }
  if (!existing.author && candidate.author) {
    data.author = candidate.author;
  }
  if (!existing.canonicalUrl && candidate.canonicalUrl) {
    data.canonicalUrl = candidate.canonicalUrl;
  }
  if (existing.dateInferred && !candidate.dateInferred) {
    data.publishedAt = candidate.publishedAt;
    data.dateInferred = false;
  }

  return data;
};

export class DeduplicationService {
  constructor(private readonly prisma: PrismaClient) {}

  async persist(items: NormalizedItem[]): Promise<PersistResult> {
    const batch = dedupeBatch(items);
    const result: PersistResult = {
      found: items.length,
      created: 0,
      updated: 0,
      skipped: 0,
      affectedNewsItemIds: []
    };

    for (const candidate of batch) {
      const existing = await this.findExisting(candidate);

      if (existing) {
        const updateData = buildUpdateData(existing, candidate);
        if (Object.keys(updateData).length > 0) {
          await this.prisma.newsItem.update({
            where: { id: existing.id },
            data: updateData
          });
          result.updated += 1;
          result.affectedNewsItemIds.push(existing.id);
        } else {
          result.skipped += 1;
        }
        continue;
      }

      const created = await this.prisma.newsItem.create({
        data: {
          sourceId: candidate.sourceId,
          title: candidate.title,
          url: candidate.url,
          canonicalUrl: candidate.canonicalUrl,
          normalizedUrl: candidate.normalizedUrl,
          author: candidate.author,
          summary: candidate.summary,
          contentText: candidate.contentText,
          language: candidate.language,
          publishedAt: candidate.publishedAt,
          dateInferred: candidate.dateInferred,
          fingerprint: candidate.fingerprint,
          rawPayload: candidate.rawPayload as object
        }
      });
      result.created += 1;
      result.affectedNewsItemIds.push(created.id);
    }

    return result;
  }

  private async findExisting(candidate: NormalizedItem): Promise<ExistingNewsItem | null> {
    if (candidate.canonicalUrl) {
      const byCanonical = await this.prisma.newsItem.findUnique({
        where: { canonicalUrl: candidate.canonicalUrl }
      });
      if (byCanonical) {
        return byCanonical;
      }
    }

    const byUrlOrFingerprint = await this.prisma.newsItem.findFirst({
      where: {
        OR: [
          { normalizedUrl: candidate.normalizedUrl },
          { fingerprint: candidate.fingerprint }
        ]
      }
    });
    if (byUrlOrFingerprint) {
      return byUrlOrFingerprint;
    }

    const sameSource = await this.prisma.newsItem.findMany({
      where: { sourceId: candidate.sourceId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        canonicalUrl: true,
        normalizedUrl: true,
        fingerprint: true,
        sourceId: true,
        summary: true,
        contentText: true,
        author: true,
        publishedAt: true,
        dateInferred: true
      }
    });

    const match = sameSource.find(
      (existing) => titleSimilarity(existing.title, candidate.title) >= TITLE_SIMILARITY_THRESHOLD
    );

    return match ?? null;
  }
}
