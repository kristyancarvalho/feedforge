import { describe, expect, it } from "vitest";
import { buildNewsFilters } from "./news.service";

describe("buildNewsFilters", () => {
  it("returns undefined fields for an empty query", () => {
    const filters = buildNewsFilters({});
    expect(filters.q).toBeUndefined();
    expect(filters.source).toBeUndefined();
    expect(filters.saved).toBeUndefined();
    expect(filters.minScore).toBeUndefined();
    expect(filters.publishedFrom).toBeUndefined();
  });

  it("trims string filters and drops blank values", () => {
    const filters = buildNewsFilters({
      q: "  linux kernel  ",
      source: "github-blog",
      topic: " open source ",
      keyword: "",
      language: "en"
    });
    expect(filters.q).toBe("linux kernel");
    expect(filters.source).toBe("github-blog");
    expect(filters.topic).toBe("open source");
    expect(filters.keyword).toBeUndefined();
    expect(filters.language).toBe("en");
  });

  it("parses numeric score filters", () => {
    const filters = buildNewsFilters({ minScore: "55", maxScore: "90" });
    expect(filters.minScore).toBe(55);
    expect(filters.maxScore).toBe(90);
  });

  it("ignores non-numeric score filters", () => {
    const filters = buildNewsFilters({ minScore: "abc", maxScore: "" });
    expect(filters.minScore).toBeUndefined();
    expect(filters.maxScore).toBeUndefined();
  });

  it("parses boolean filters from strings", () => {
    const filters = buildNewsFilters({
      saved: "true",
      hasSummary: "false",
      hasReasons: "true",
      hasNegativePenalty: "false"
    });
    expect(filters.saved).toBe(true);
    expect(filters.hasSummary).toBe(false);
    expect(filters.hasReasons).toBe(true);
    expect(filters.hasNegativePenalty).toBe(false);
  });

  it("leaves boolean filters undefined for unrecognized values", () => {
    const filters = buildNewsFilters({ saved: "maybe", hasSummary: "1" });
    expect(filters.saved).toBeUndefined();
    expect(filters.hasSummary).toBeUndefined();
  });

  it("parses valid published date ranges", () => {
    const filters = buildNewsFilters({
      publishedFrom: "2024-01-01T00:00:00.000Z",
      publishedTo: "2024-02-01T00:00:00.000Z"
    });
    expect(filters.publishedFrom).toBeInstanceOf(Date);
    expect(filters.publishedTo).toBeInstanceOf(Date);
    expect(filters.publishedFrom?.toISOString()).toBe("2024-01-01T00:00:00.000Z");
  });

  it("ignores invalid published dates", () => {
    const filters = buildNewsFilters({ publishedFrom: "not-a-date" });
    expect(filters.publishedFrom).toBeUndefined();
  });

  it("passes through match strength, run id and sort", () => {
    const filters = buildNewsFilters({
      matchStrength: "strong",
      runId: "run_123",
      sort: "technical_depth_desc"
    });
    expect(filters.matchStrength).toBe("strong");
    expect(filters.runId).toBe("run_123");
    expect(filters.sort).toBe("technical_depth_desc");
  });
});
