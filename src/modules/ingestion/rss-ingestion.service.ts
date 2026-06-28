import RssParser from "rss-parser";
import { fetchText } from "../../shared/http";
import { stripHtml, normalizeWhitespace } from "../../shared/text";
import type { RssSource } from "../sources/source.schema";
import type { CrawlOptions, RawItem, SourceCrawlResult } from "./ingestion.types";

const parser = new RssParser();

const pickString = (...values: Array<unknown>): string | null => {
  for (const value of values) {
    if (typeof value === "string") {
      const clean = normalizeWhitespace(value);
      if (clean) {
        return clean;
      }
    }
  }
  return null;
};

export const parseRssFeed = async (
  xml: string,
  source: RssSource
): Promise<RawItem[]> => {
  const feed = await parser.parseString(xml);

  return (feed.items ?? [])
    .map((item) => {
      const title = pickString(item.title);
      const url = pickString(item.link, (item as { guid?: string }).guid);

      if (!title || !url) {
        return null;
      }

      const summarySource = pickString(
        item.contentSnippet,
        (item as { summary?: string }).summary,
        item.content
      );

      const contentText = pickString(
        (item as { "content:encoded"?: string })["content:encoded"],
        item.content,
        item.contentSnippet
      );

      const rawItem: RawItem = {
        sourceId: source.id,
        title,
        url,
        summary: summarySource ? stripHtml(summarySource) : null,
        contentText: contentText ? stripHtml(contentText) : null,
        author: pickString(item.creator, (item as { author?: string }).author),
        publishedAt: pickString(item.isoDate, item.pubDate),
        language: source.language,
        raw: { ...item }
      };

      return rawItem;
    })
    .filter((item): item is RawItem => item !== null);
};

export const crawlRssSource = async (
  source: RssSource,
  options: CrawlOptions
): Promise<SourceCrawlResult> => {
  try {
    const xml = await fetchText(source.url, options);
    const items = await parseRssFeed(xml, source);
    return { sourceId: source.id, ok: true, items, error: null };
  } catch (error) {
    return {
      sourceId: source.id,
      ok: false,
      items: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
