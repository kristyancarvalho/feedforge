import { describe, expect, it } from "vitest";
import { dedupeBatch, isDuplicate, type ComparableItem } from "./deduplication.service";

const item = (overrides: Partial<ComparableItem>): ComparableItem => ({
  canonicalUrl: "https://example.com/a",
  normalizedUrl: "example.com/a",
  fingerprint: "fp-a",
  sourceId: "source-1",
  title: "Linux kernel release",
  ...overrides
});

describe("deduplication", () => {
  it("detects duplicates by canonical url", () => {
    const a = item({});
    const b = item({ fingerprint: "fp-b", normalizedUrl: "example.com/other" });
    expect(isDuplicate(a, b)).toBe(true);
  });

  it("detects duplicates by normalized url", () => {
    const a = item({ canonicalUrl: null });
    const b = item({ canonicalUrl: null, fingerprint: "fp-b" });
    expect(isDuplicate(a, b)).toBe(true);
  });

  it("detects duplicates by fingerprint", () => {
    const a = item({ canonicalUrl: "https://example.com/a", normalizedUrl: "example.com/a" });
    const b = item({ canonicalUrl: "https://example.com/b", normalizedUrl: "example.com/b" });
    expect(isDuplicate(a, b)).toBe(true);
  });

  it("detects duplicates by similar title within the same source", () => {
    const a = item({ canonicalUrl: null, normalizedUrl: "example.com/a", fingerprint: "fp-a" });
    const b = item({
      canonicalUrl: null,
      normalizedUrl: "example.com/b",
      fingerprint: "fp-b",
      title: "Linux kernel release"
    });
    expect(isDuplicate(a, b)).toBe(true);
  });

  it("treats different items from different sources as unique", () => {
    const a = item({
      canonicalUrl: "https://example.com/a",
      normalizedUrl: "example.com/a",
      fingerprint: "fp-a"
    });
    const b = item({
      canonicalUrl: "https://other.com/b",
      normalizedUrl: "other.com/b",
      fingerprint: "fp-b",
      sourceId: "source-2",
      title: "Completely different headline"
    });
    expect(isDuplicate(a, b)).toBe(false);
  });

  it("collapses duplicates in a batch keeping the first occurrence", () => {
    const items = [
      item({}),
      item({ fingerprint: "fp-b", normalizedUrl: "example.com/dup" }),
      item({
        canonicalUrl: "https://example.com/c",
        normalizedUrl: "example.com/c",
        fingerprint: "fp-c",
        title: "Different topic entirely"
      })
    ];
    const unique = dedupeBatch(items);
    expect(unique).toHaveLength(2);
  });
});
