import { describe, expect, it } from "vitest";
import { parseSourcesConfig } from "./source-loader";

const validConfig = {
  editorialProfile: {
    name: "Test Radar",
    language: ["pt-BR", "en"],
    topics: ["linux", "open source"],
    negativeTopics: ["sports"]
  },
  sources: [
    {
      id: "rss-one",
      name: "RSS One",
      type: "rss",
      url: "https://example.com/feed",
      language: "en",
      tags: ["linux"],
      weight: 1.1,
      enabled: true
    },
    {
      id: "html-one",
      name: "HTML One",
      type: "html",
      url: "https://example.com/news",
      language: "pt-BR",
      tags: ["open source"],
      weight: 1,
      enabled: false,
      selectors: {
        item: "article",
        title: "h2",
        link: "a"
      }
    }
  ]
};

describe("source schema validation", () => {
  it("accepts a valid configuration", () => {
    const config = parseSourcesConfig(JSON.stringify(validConfig));
    expect(config.sources).toHaveLength(2);
    expect(config.editorialProfile.topics).toContain("linux");
  });

  it("rejects invalid JSON", () => {
    expect(() => parseSourcesConfig("{ not json")).toThrowError(/valid JSON/);
  });

  it("rejects an unsupported language", () => {
    const invalid = structuredClone(validConfig);
    (invalid.sources[0] as { language: string }).language = "es";
    expect(() => parseSourcesConfig(JSON.stringify(invalid))).toThrowError(
      /Invalid source configuration/
    );
  });

  it("rejects an unsupported source type", () => {
    const invalid = structuredClone(validConfig);
    (invalid.sources[0] as { type: string }).type = "json";
    expect(() => parseSourcesConfig(JSON.stringify(invalid))).toThrowError(
      /Invalid source configuration/
    );
  });

  it("rejects html sources without required selectors", () => {
    const invalid = structuredClone(validConfig);
    delete (invalid.sources[1] as { selectors?: unknown }).selectors;
    expect(() => parseSourcesConfig(JSON.stringify(invalid))).toThrowError(
      /Invalid source configuration/
    );
  });

  it("rejects duplicate source ids", () => {
    const invalid = structuredClone(validConfig);
    (invalid.sources[1] as { id: string }).id = "rss-one";
    expect(() => parseSourcesConfig(JSON.stringify(invalid))).toThrowError(
      /Invalid source configuration/
    );
  });

  it("rejects sources with empty tags", () => {
    const invalid = structuredClone(validConfig);
    (invalid.sources[0] as { tags: string[] }).tags = [];
    expect(() => parseSourcesConfig(JSON.stringify(invalid))).toThrowError(
      /Invalid source configuration/
    );
  });
});
