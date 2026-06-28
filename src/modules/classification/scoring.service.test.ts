import { describe, expect, it } from "vitest";
import {
  clamp,
  finalScore,
  freshnessScore,
  keywordScore,
  matchStrength,
  negativePenalty,
  noveltyScore,
  openSourceRelevanceScore,
  sourceScore,
  technicalDepthScore,
  topicScore
} from "./scoring.service";
import type { TermMatch } from "./topic-matcher";

const match = (field: TermMatch["field"], term = "linux"): TermMatch => ({ term, field });

describe("scoring", () => {
  it("clamps values to the 0..100 range", () => {
    expect(clamp(-10)).toBe(0);
    expect(clamp(150)).toBe(100);
    expect(clamp(42)).toBe(42);
  });

  it("maps source weight to a score", () => {
    expect(sourceScore(1)).toBe(70);
    expect(sourceScore(1.1)).toBeCloseTo(80);
    expect(sourceScore(1.2)).toBeCloseTo(90);
    expect(sourceScore(1.3)).toBe(100);
    expect(sourceScore(1.5)).toBe(100);
    expect(sourceScore(0.8)).toBeCloseTo(50);
  });

  it("scores freshness by age", () => {
    const now = new Date("2024-05-10T12:00:00Z");
    expect(freshnessScore(new Date("2024-05-10T08:00:00Z"), false, now)).toBe(100);
    expect(freshnessScore(new Date("2024-05-08T12:00:00Z"), false, now)).toBe(85);
    expect(freshnessScore(new Date("2024-05-04T12:00:00Z"), false, now)).toBe(70);
    expect(freshnessScore(new Date("2024-04-20T12:00:00Z"), false, now)).toBe(40);
    expect(freshnessScore(new Date("2024-01-01T12:00:00Z"), false, now)).toBe(15);
    expect(freshnessScore(null, false, now)).toBe(25);
    expect(freshnessScore(new Date("2024-05-10T08:00:00Z"), true, now)).toBe(25);
  });

  it("computes topic score weighting title matches highest", () => {
    expect(topicScore([match("title")])).toBe(45);
    expect(topicScore([match("tags")])).toBe(25);
    expect(topicScore([match("summary")])).toBe(20);
    expect(topicScore([match("content")])).toBe(12);
    expect(topicScore([])).toBe(0);
    expect(topicScore([match("title"), match("summary", "rust")])).toBe(65);
  });

  it("computes keyword score weighting title matches highest", () => {
    expect(keywordScore([match("title")])).toBe(40);
    expect(keywordScore([match("tags")])).toBe(22);
    expect(keywordScore([match("summary")])).toBe(18);
    expect(keywordScore([])).toBe(0);
  });

  it("rewards technical depth signals by field", () => {
    expect(technicalDepthScore([match("title", "cve")])).toBe(32);
    expect(technicalDepthScore([match("summary", "kernel")])).toBe(24);
    expect(technicalDepthScore([match("content", "protocol")])).toBe(18);
    expect(technicalDepthScore([])).toBe(0);
    expect(
      technicalDepthScore([match("title", "cve"), match("summary", "kernel")])
    ).toBe(56);
  });

  it("rewards open source relevance signals by field", () => {
    expect(openSourceRelevanceScore([match("title", "open source")])).toBe(38);
    expect(openSourceRelevanceScore([match("tags", "linux")])).toBe(30);
    expect(openSourceRelevanceScore([match("summary", "license")])).toBe(22);
    expect(openSourceRelevanceScore([])).toBe(0);
  });

  it("applies a stronger negative penalty for negative matches", () => {
    expect(negativePenalty([match("title", "sports")])).toBeCloseTo(57.5);
    expect(negativePenalty([match("summary", "press release")])).toBeCloseTo(40);
    expect(negativePenalty([match("tags", "crypto price")])).toBeCloseTo(37.5);
    expect(negativePenalty([])).toBe(0);
    expect(
      negativePenalty([match("title", "sports"), match("summary", "celebrity")])
    ).toBeCloseTo(97.5);
    expect(
      negativePenalty([
        match("title", "sports"),
        match("summary", "celebrity"),
        match("tags", "crypto price")
      ])
    ).toBe(100);
  });

  it("maps a final score to a match strength label", () => {
    expect(matchStrength(95)).toBe("strong");
    expect(matchStrength(80)).toBe("strong");
    expect(matchStrength(79)).toBe("good");
    expect(matchStrength(65)).toBe("good");
    expect(matchStrength(64)).toBe("weak");
    expect(matchStrength(45)).toBe("weak");
    expect(matchStrength(44)).toBe("low");
    expect(matchStrength(0)).toBe("low");
  });

  it("reduces novelty when similar items already exist", () => {
    const high = noveltyScore({ title: "fresh topic", topics: ["rust"] }, []);
    expect(high).toBe(100);
    const low = noveltyScore(
      { title: "linux security release", topics: ["linux", "security"] },
      [
        { title: "linux security release", topics: ["linux", "security"] },
        { title: "linux security release", topics: ["linux", "security"] }
      ]
    );
    expect(low).toBeLessThan(100);
    expect(low).toBeGreaterThanOrEqual(20);
  });

  it("computes the weighted final score and clamps it", () => {
    const score = finalScore({
      topicScore: 100,
      keywordScore: 100,
      technicalDepthScore: 100,
      openSourceRelevanceScore: 100,
      sourceScore: 100,
      freshnessScore: 100,
      noveltyScore: 100,
      negativePenalty: 0
    });
    expect(score).toBe(100);

    const penalized = finalScore({
      topicScore: 50,
      keywordScore: 50,
      technicalDepthScore: 50,
      openSourceRelevanceScore: 50,
      sourceScore: 70,
      freshnessScore: 40,
      noveltyScore: 60,
      negativePenalty: 100
    });
    expect(penalized).toBe(0);
  });

  it("weights the new technical and open source components into the final score", () => {
    const base = {
      topicScore: 60,
      keywordScore: 60,
      technicalDepthScore: 0,
      openSourceRelevanceScore: 0,
      sourceScore: 80,
      freshnessScore: 85,
      noveltyScore: 80,
      negativePenalty: 0
    };
    const withDepth = finalScore({
      ...base,
      technicalDepthScore: 80,
      openSourceRelevanceScore: 80
    });
    expect(withDepth).toBeGreaterThan(finalScore(base));
  });
});
