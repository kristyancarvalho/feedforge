import { describe, expect, it } from "vitest";
import { classifyItem, type ClassificationInput } from "./classifier.service";

const baseInput = (overrides: Partial<ClassificationInput> = {}): ClassificationInput => ({
  title: "Linux kernel security fix released",
  summary: "A new open source kernel patch improves security.",
  contentText: null,
  publishedAt: new Date(),
  dateInferred: false,
  sourceTags: ["linux", "open source"],
  sourceWeight: 1.2,
  topics: ["linux", "open source", "security"],
  negativeTopics: ["sports", "celebrity"],
  recent: [],
  now: new Date(),
  ...overrides
});

describe("classifier", () => {
  it("produces a high score for a relevant fresh item", () => {
    const result = classifyItem(baseInput());
    expect(result.finalScore).toBeGreaterThan(70);
    expect(result.detectedTopics).toContain("linux");
    expect(result.matchedKeywords.length).toBeGreaterThan(0);
  });

  it("stores human-readable reasons for topic and freshness", () => {
    const result = classifyItem(baseInput());
    expect(result.reasons.some((reason) => reason.includes('Matched topic "linux"'))).toBe(true);
    expect(result.reasons.some((reason) => reason.includes("last 24 hours"))).toBe(true);
  });

  it("clamps all scores between 0 and 100", () => {
    const result = classifyItem(baseInput());
    for (const value of [
      result.finalScore,
      result.topicScore,
      result.keywordScore,
      result.sourceScore,
      result.freshnessScore,
      result.noveltyScore
    ]) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  it("reduces the score for negative topics and explains why", () => {
    const negative = classifyItem(
      baseInput({
        title: "Celebrity sports gossip roundup",
        summary: "Pure celebrity and sports news with no technical value.",
        sourceTags: [],
        topics: ["linux"],
        sourceWeight: 1
      })
    );
    expect(negative.negativePenalty).toBeGreaterThan(0);
    expect(
      negative.reasons.some((reason) => reason.startsWith("Reduced score due to negative topic"))
    ).toBe(true);
  });

  it("reports when no editorial topics or keywords matched", () => {
    const result = classifyItem(
      baseInput({
        title: "A quiet afternoon in the garden",
        summary: "Nothing technical here.",
        sourceTags: [],
        topics: ["linux"],
        negativeTopics: []
      })
    );
    expect(result.reasons).toContain("No editorial topics or keywords matched");
  });
});
