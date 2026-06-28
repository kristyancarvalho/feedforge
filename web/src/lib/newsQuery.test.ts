import { describe, expect, it } from "vitest";
import { NEWS_FILTER_KEYS, activeFilterCount, paramsToNewsFilters } from "./newsQuery";

describe("paramsToNewsFilters", () => {
  it("returns an empty object when no params are present", () => {
    expect(paramsToNewsFilters(new URLSearchParams())).toEqual({});
  });

  it("collects every recognised filter key", () => {
    const params = new URLSearchParams({
      q: "linux",
      source: "github-blog",
      topic: "kernel",
      language: "en",
      minScore: "60",
      matchStrength: "strong",
      sort: "score_desc"
    });
    expect(paramsToNewsFilters(params)).toEqual({
      q: "linux",
      source: "github-blog",
      topic: "kernel",
      language: "en",
      minScore: "60",
      matchStrength: "strong",
      sort: "score_desc"
    });
  });

  it("ignores blank values", () => {
    const params = new URLSearchParams({ q: "", source: "github-blog" });
    expect(paramsToNewsFilters(params)).toEqual({ source: "github-blog" });
  });

  it("ignores keys outside the recognised set", () => {
    const params = new URLSearchParams({ page: "2", cursor: "abc", q: "go" });
    expect(paramsToNewsFilters(params)).toEqual({ q: "go" });
  });
});

describe("activeFilterCount", () => {
  it("counts only non-empty recognised filters", () => {
    const params = new URLSearchParams({ q: "go", source: "", topic: "kernel", page: "3" });
    expect(activeFilterCount(params)).toBe(2);
  });

  it("excludes ignored keys", () => {
    const params = new URLSearchParams({ saved: "true", topic: "kernel", language: "en" });
    expect(activeFilterCount(params, ["saved"])).toBe(2);
  });

  it("returns zero when there are no active filters", () => {
    expect(activeFilterCount(new URLSearchParams())).toBe(0);
  });
});

describe("NEWS_FILTER_KEYS", () => {
  it("has no duplicate keys", () => {
    expect(new Set(NEWS_FILTER_KEYS).size).toBe(NEWS_FILTER_KEYS.length);
  });
});
