import { describe, expect, it } from "vitest";
import { extractDomain, normalizeUrl } from "./url-normalizer";

describe("url normalization", () => {
  it("removes tracking params and hash fragments", () => {
    const result = normalizeUrl(
      "https://example.com/post?utm_source=news&id=5#section"
    );
    expect(result.canonicalUrl).toBe("https://example.com/post?id=5");
    expect(result.normalizedUrl).toBe("example.com/post?id=5");
  });

  it("strips www and trailing slashes for the normalized url", () => {
    const result = normalizeUrl("https://www.example.com/blog/");
    expect(result.normalizedUrl).toBe("example.com/blog");
  });

  it("resolves relative urls against a base", () => {
    const result = normalizeUrl("/articles/1", "https://example.com/news");
    expect(result.canonicalUrl).toBe("https://example.com/articles/1");
    expect(result.normalizedUrl).toBe("example.com/articles/1");
  });

  it("produces identical normalized urls regardless of tracking params", () => {
    const a = normalizeUrl("https://example.com/x?utm_campaign=a&b=2");
    const b = normalizeUrl("https://example.com/x?b=2");
    expect(a.normalizedUrl).toBe(b.normalizedUrl);
  });

  it("returns a lowercased fallback for invalid urls", () => {
    const result = normalizeUrl("not a url");
    expect(result.canonicalUrl).toBeNull();
    expect(result.normalizedUrl).toBe("not a url");
  });

  it("extracts a domain without www", () => {
    expect(extractDomain("https://www.example.com/path")).toBe("example.com");
    expect(extractDomain("broken")).toBe("");
  });
});
