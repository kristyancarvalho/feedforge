import { describe, expect, it } from "vitest";
import { matchTerm, matchTerms } from "./topic-matcher";
import { vectorize } from "./text-vectorizer";

const vector = (overrides: {
  title?: string;
  summary?: string | null;
  contentText?: string | null;
  tags?: string[];
}) =>
  vectorize({
    title: overrides.title ?? "",
    summary: overrides.summary ?? null,
    contentText: overrides.contentText ?? null,
    tags: overrides.tags ?? []
  });

describe("topic and keyword matching", () => {
  it("matches a single word term in the title", () => {
    expect(matchTerm("linux", vector({ title: "New Linux release" }))).toBe("title");
  });

  it("matches multi-word terms", () => {
    expect(matchTerm("open source", vector({ summary: "An open source project" }))).toBe("summary");
  });

  it("matches terms containing dots like node.js", () => {
    expect(matchTerm("node.js", vector({ title: "Node.js 22 is here" }))).toBe("title");
  });

  it("prefers the title field over summary and tags", () => {
    const result = matchTerm(
      "linux",
      vector({ title: "Linux news", summary: "linux", tags: ["linux"] })
    );
    expect(result).toBe("title");
  });

  it("matches terms in source tags", () => {
    expect(matchTerm("kubernetes", vector({ tags: ["kubernetes"] }))).toBe("tags");
  });

  it("returns null when nothing matches", () => {
    expect(matchTerm("rust", vector({ title: "About cooking" }))).toBeNull();
  });

  it("deduplicates repeated terms and returns matches", () => {
    const matches = matchTerms(
      ["linux", "linux", "security"],
      vector({ title: "Linux security advisory" })
    );
    expect(matches).toHaveLength(2);
    expect(matches.map((match) => match.term)).toEqual(["linux", "security"]);
  });
});
