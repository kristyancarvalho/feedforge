import { describe, expect, it } from "vitest";
import { normalizeText, stripAccents, stripHtml, titleSimilarity, truncate } from "./text";

describe("text normalization", () => {
  it("removes accents", () => {
    expect(stripAccents("segurança privacidade")).toBe("seguranca privacidade");
  });

  it("lowercases, strips accents and collapses whitespace", () => {
    expect(normalizeText("  Linux   SEGURANÇA  ")).toBe("linux seguranca");
  });

  it("preserves meaningful technical characters", () => {
    expect(normalizeText("Node.js and C# / Go!")).toBe("node.js and c# go");
  });

  it("returns empty string for nullish input", () => {
    expect(normalizeText(null)).toBe("");
    expect(normalizeText(undefined)).toBe("");
  });

  it("strips html tags", () => {
    expect(stripHtml("<p>Hello <b>World</b></p>")).toBe("Hello World");
  });

  it("truncates long strings with an ellipsis", () => {
    expect(truncate("abcdefghij", 5)).toBe("abcd\u2026");
    expect(truncate("short", 10)).toBe("short");
  });

  it("computes jaccard title similarity", () => {
    expect(titleSimilarity("linux kernel release", "linux kernel release")).toBe(1);
    expect(titleSimilarity("linux kernel", "windows update")).toBe(0);
    expect(titleSimilarity("", "anything")).toBe(0);
  });
});
