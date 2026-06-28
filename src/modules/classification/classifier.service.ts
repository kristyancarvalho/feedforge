import type { PrismaClient } from "@prisma/client";
import { logger } from "../../shared/logger";
import type { EditorialProfile } from "../sources/source.schema";
import { KEYWORDS } from "./keywords";
import {
  finalScore,
  freshnessScore,
  keywordScore,
  negativePenalty,
  noveltyScore,
  sourceScore,
  topicScore,
  type RecentReference
} from "./scoring.service";
import { matchTerms, type MatchField, type TermMatch } from "./topic-matcher";
import { vectorize, type ClassifiableItem } from "./text-vectorizer";

export interface ClassificationInput {
  title: string;
  summary: string | null;
  contentText: string | null;
  publishedAt: Date | null;
  dateInferred: boolean;
  sourceTags: string[];
  sourceWeight: number;
  topics: string[];
  negativeTopics: string[];
  recent: RecentReference[];
  now?: Date;
}

export interface ClassificationResult {
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

const FIELD_LABELS: Record<MatchField, string> = {
  title: "title",
  summary: "summary",
  content: "content",
  tags: "source tags"
};

const buildReasons = (
  topicMatches: TermMatch[],
  keywordMatches: TermMatch[],
  negativeMatches: TermMatch[],
  scores: {
    freshness: number;
    source: number;
    novelty: number;
  }
): string[] => {
  const reasons: string[] = [];

  for (const match of topicMatches.slice(0, 6)) {
    reasons.push(`Matched topic "${match.term}" in ${FIELD_LABELS[match.field]}`);
  }

  const topicTerms = new Set(topicMatches.map((match) => match.term));
  for (const match of keywordMatches.filter((match) => !topicTerms.has(match.term)).slice(0, 4)) {
    reasons.push(`Matched keyword "${match.term}" in ${FIELD_LABELS[match.field]}`);
  }

  if (topicMatches.length === 0 && keywordMatches.length === 0) {
    reasons.push("No editorial topics or keywords matched");
  }

  if (scores.freshness >= 100) {
    reasons.push("Recent item published in the last 24 hours");
  } else if (scores.freshness >= 85) {
    reasons.push("Recent item published in the last few days");
  } else if (scores.freshness <= 15) {
    reasons.push("Older item, freshness reduced");
  } else if (scores.freshness === 25) {
    reasons.push("Publication date unknown, freshness reduced");
  }

  if (scores.source >= 90) {
    reasons.push("High-trust source weight boosted score");
  } else if (scores.source >= 80) {
    reasons.push("Source weight boosted score");
  } else if (scores.source < 70) {
    reasons.push("Lower source weight reduced score");
  }

  if (scores.novelty >= 80) {
    reasons.push("High novelty compared to recent collected items");
  } else if (scores.novelty <= 40) {
    reasons.push("Reduced novelty due to similar recent items");
  }

  for (const match of negativeMatches) {
    reasons.push(`Reduced score due to negative topic "${match.term}"`);
  }

  return reasons;
};

export const classifyItem = (input: ClassificationInput): ClassificationResult => {
  const item: ClassifiableItem = {
    title: input.title,
    summary: input.summary,
    contentText: input.contentText,
    tags: input.sourceTags
  };

  const vector = vectorize(item);

  const topicMatches = matchTerms(input.topics, vector);
  const keywordMatches = matchTerms(KEYWORDS, vector);
  const negativeMatches = matchTerms(input.negativeTopics, vector);

  const detectedTopics = topicMatches.map((match) => match.term);
  const matchedKeywords = keywordMatches.map((match) => match.term);

  const topic = topicScore(topicMatches);
  const keyword = keywordScore(keywordMatches);
  const source = sourceScore(input.sourceWeight);
  const freshness = freshnessScore(input.publishedAt, input.dateInferred, input.now);
  const novelty = noveltyScore(
    { title: input.title, topics: detectedTopics },
    input.recent
  );
  const penalty = negativePenalty(negativeMatches);

  const breakdown = {
    topicScore: topic,
    keywordScore: keyword,
    sourceScore: source,
    freshnessScore: freshness,
    noveltyScore: novelty,
    negativePenalty: penalty
  };

  const reasons = buildReasons(topicMatches, keywordMatches, negativeMatches, {
    freshness,
    source,
    novelty
  });

  return {
    ...breakdown,
    finalScore: finalScore(breakdown),
    detectedTopics,
    matchedKeywords,
    reasons
  };
};

export class ClassifierService {
  constructor(private readonly prisma: PrismaClient) {}

  async classifyNewsItems(
    newsItemIds: string[],
    profile: EditorialProfile,
    now: Date = new Date()
  ): Promise<number> {
    if (newsItemIds.length === 0) {
      return 0;
    }

    const recentItems = await this.prisma.newsItem.findMany({
      orderBy: { publishedAt: "desc" },
      take: 200,
      include: { classification: true, source: true }
    });

    const recentReferences: RecentReference[] = recentItems
      .filter((item) => !newsItemIds.includes(item.id))
      .map((item) => ({
        title: item.title,
        topics: item.classification?.detectedTopics ?? []
      }));

    let classified = 0;

    for (const id of newsItemIds) {
      const item = await this.prisma.newsItem.findUnique({
        where: { id },
        include: { source: true }
      });

      if (!item) {
        continue;
      }

      const result = classifyItem({
        title: item.title,
        summary: item.summary,
        contentText: item.contentText,
        publishedAt: item.publishedAt,
        dateInferred: item.dateInferred,
        sourceTags: item.source.tags,
        sourceWeight: item.source.weight,
        topics: profile.topics,
        negativeTopics: profile.negativeTopics,
        recent: recentReferences,
        now
      });

      await this.prisma.classification.upsert({
        where: { newsItemId: id },
        create: { newsItemId: id, ...result },
        update: { ...result }
      });

      recentReferences.push({ title: item.title, topics: result.detectedTopics });
      classified += 1;
    }

    logger.info("classification summary", { classified });
    return classified;
  }
}
