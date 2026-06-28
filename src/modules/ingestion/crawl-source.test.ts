import { afterEach, describe, expect, it, vi } from "vitest";
import { crawlSource } from "./crawl-source";
import { fetchText } from "../../shared/http";
import type { RssSource } from "../sources/source.schema";

vi.mock("../../shared/http", () => ({
  fetchText: vi.fn()
}));

const fetchTextMock = vi.mocked(fetchText);

const options = { userAgent: "FeedForgeBot/test", timeoutMs: 1000 };

const source: RssSource = {
  id: "feed",
  name: "Feed",
  type: "rss",
  url: "https://example.com/feed",
  language: "en",
  tags: ["linux"],
  weight: 1,
  enabled: true
};

const sampleFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Example</title>
    <item>
      <title>Linux kernel released</title>
      <link>https://example.com/linux</link>
    </item>
  </channel>
</rss>`;

describe("crawlSource failure isolation", () => {
  afterEach(() => {
    fetchTextMock.mockReset();
  });

  it("returns a failed result instead of throwing when the network fails", async () => {
    fetchTextMock.mockRejectedValueOnce(new Error("HTTP 403"));

    const result = await crawlSource(source, options);

    expect(result.ok).toBe(false);
    expect(result.items).toEqual([]);
    expect(result.error).toContain("403");
    expect(result.sourceId).toBe("feed");
  });

  it("returns parsed items on a successful fetch", async () => {
    fetchTextMock.mockResolvedValueOnce(sampleFeed);

    const result = await crawlSource(source, options);

    expect(result.ok).toBe(true);
    expect(result.error).toBeNull();
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.url).toBe("https://example.com/linux");
  });
});
