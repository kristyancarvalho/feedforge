import { describe, expect, it } from "vitest";
import { parseRssFeed } from "./rss-ingestion.service";
import type { RssSource } from "../sources/source.schema";

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
      <title>Linux kernel 6.9 released</title>
      <link>https://example.com/linux-6-9</link>
      <description>&lt;p&gt;A new &lt;b&gt;kernel&lt;/b&gt; is out.&lt;/p&gt;</description>
      <pubDate>Mon, 06 May 2024 10:00:00 GMT</pubDate>
      <author>Maintainer</author>
    </item>
    <item>
      <title>Missing link entry</title>
    </item>
  </channel>
</rss>`;

describe("rss ingestion", () => {
  it("parses valid feed items and skips items without a link", async () => {
    const items = await parseRssFeed(sampleFeed, source);
    expect(items).toHaveLength(1);
    const [first] = items;
    expect(first?.title).toBe("Linux kernel 6.9 released");
    expect(first?.url).toBe("https://example.com/linux-6-9");
    expect(first?.summary).toBe("A new kernel is out.");
    expect(first?.language).toBe("en");
    expect(first?.publishedAt).toContain("2024");
  });

  it("returns an empty array for a feed without items", async () => {
    const empty = `<?xml version="1.0"?><rss version="2.0"><channel><title>Empty</title></channel></rss>`;
    const items = await parseRssFeed(empty, source);
    expect(items).toEqual([]);
  });
});
