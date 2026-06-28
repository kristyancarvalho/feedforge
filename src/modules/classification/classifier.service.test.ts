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

  it("rewards technical depth and explains it", () => {
    const result = classifyItem(
      baseInput({
        title: "Kernel CVE patch and release notes for the new driver",
        summary: "Detailed changelog covering the vulnerability and protocol changes.",
        contentText: "The implementation updates the scheduler and syscall handling."
      })
    );
    expect(result.technicalDepthScore).toBeGreaterThan(0);
    expect(
      result.reasons.some(
        (reason) =>
          reason.startsWith("High technical depth") ||
          reason === "Moderate technical depth detected"
      )
    ).toBe(true);
  });

  it("rewards explicit open source relevance and explains it", () => {
    const result = classifyItem(
      baseInput({
        title: "Open source maintainer relicenses project under the MIT license",
        summary: "The community foundation welcomes new contributors upstream.",
        sourceTags: ["open source", "linux"]
      })
    );
    expect(result.openSourceRelevanceScore).toBeGreaterThan(0);
    expect(
      result.reasons.some(
        (reason) =>
          reason.startsWith("Strong open source relevance") ||
          reason === "Some open source relevance detected"
      )
    ).toBe(true);
  });

  it("derives a match strength label consistent with the final score", () => {
    const strong = classifyItem(baseInput());
    expect(["strong", "good", "weak", "low"]).toContain(strong.matchStrength);
    if (strong.finalScore >= 80) {
      expect(strong.matchStrength).toBe("strong");
    }

    const weak = classifyItem(
      baseInput({
        title: "Generic press release about a startup funding round",
        summary: "Marketing fluff with no technical content.",
        sourceTags: [],
        topics: ["linux"],
        sourceWeight: 0.9,
        negativeTopics: ["startup funding", "press release"]
      })
    );
    expect(weak.finalScore).toBeLessThan(strong.finalScore);
    expect(["weak", "low"]).toContain(weak.matchStrength);
  });
});
