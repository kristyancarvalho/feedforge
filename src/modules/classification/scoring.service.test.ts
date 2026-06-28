import { describe, expect, it } from "vitest";
import {
  clamp,
  finalScore,
  freshnessScore,
  negativePenalty,
  noveltyScore,
  sourceScore,
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
    expect(topicScore([match("summary")])).toBe(20);
    expect(topicScore([])).toBe(0);
  });

  it("applies a negative penalty for negative matches", () => {
    expect(negativePenalty([match("title", "sports")])).toBe(30);
    expect(negativePenalty([])).toBe(0);
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
  });

  it("computes the weighted final score and clamps it", () => {
    const score = finalScore({
      topicScore: 100,
      keywordScore: 100,
      sourceScore: 100,
      freshnessScore: 100,
      noveltyScore: 100,
      negativePenalty: 0
    });
    expect(score).toBe(100);

    const penalized = finalScore({
      topicScore: 50,
      keywordScore: 50,
      sourceScore: 70,
      freshnessScore: 40,
      noveltyScore: 60,
      negativePenalty: 100
    });
    expect(penalized).toBe(0);
  });
});
