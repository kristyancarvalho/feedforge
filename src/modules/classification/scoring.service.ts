import { daysBetween } from "../../shared/dates";
import { titleSimilarity } from "../../shared/text";
import type { MatchField, TermMatch } from "./topic-matcher";

export const clamp = (value: number, min = 0, max = 100): number =>
  Math.min(max, Math.max(min, value));

const TOPIC_FIELD_POINTS: Record<MatchField, number> = {
  title: 45,
  tags: 25,
  summary: 20,
  content: 12
};

const KEYWORD_FIELD_POINTS: Record<MatchField, number> = {
  title: 40,
  tags: 22,
  summary: 18,
  content: 10
};

const NEGATIVE_FIELD_POINTS: Record<MatchField, number> = {
  title: 30,
  summary: 20,
  tags: 20,
  content: 12
};

const sumMatches = (
  matches: TermMatch[],
  points: Record<MatchField, number>
): number => matches.reduce((total, match) => total + points[match.field], 0);

export const topicScore = (matches: TermMatch[]): number =>
  clamp(sumMatches(matches, TOPIC_FIELD_POINTS));

export const keywordScore = (matches: TermMatch[]): number =>
  clamp(sumMatches(matches, KEYWORD_FIELD_POINTS));

export const negativePenalty = (matches: TermMatch[]): number =>
  clamp(sumMatches(matches, NEGATIVE_FIELD_POINTS));

export const sourceScore = (weight: number): number =>
  clamp(70 + (weight - 1) * 100);

export interface RecentReference {
  title: string;
  topics: string[];
}

export const freshnessScore = (
  publishedAt: Date | null,
  inferred: boolean,
  now: Date = new Date()
): number => {
  if (!publishedAt || inferred) {
    return 25;
  }

  const ageDays = daysBetween(publishedAt, now);
  if (ageDays < 0) {
    return 100;
  }
  if (ageDays < 1) {
    return 100;
  }
  if (ageDays <= 3) {
    return 85;
  }
  if (ageDays <= 7) {
    return 70;
  }
  if (ageDays <= 30) {
    return 40;
  }
  return 15;
};

export const noveltyScore = (
  candidate: RecentReference,
  recent: RecentReference[]
): number => {
  if (recent.length === 0) {
    return 100;
  }

  const candidateTopics = new Set(candidate.topics);

  const similar = recent.filter((reference) => {
    const sharedTopics = reference.topics.filter((topic) => candidateTopics.has(topic)).length;
    const similarTitle = titleSimilarity(reference.title, candidate.title) >= 0.6;
    return sharedTopics >= 2 || similarTitle;
  }).length;

  return clamp(100 - similar * 25, 20, 100);
};

export interface ScoreBreakdown {
  topicScore: number;
  keywordScore: number;
  sourceScore: number;
  freshnessScore: number;
  noveltyScore: number;
  negativePenalty: number;
}

export const finalScore = (breakdown: ScoreBreakdown): number =>
  clamp(
    breakdown.topicScore * 0.35 +
      breakdown.keywordScore * 0.25 +
      breakdown.sourceScore * 0.15 +
      breakdown.freshnessScore * 0.15 +
      breakdown.noveltyScore * 0.1 -
      breakdown.negativePenalty
  );
