import * as cheerio from "cheerio";
import { fetchText } from "../../shared/http";
import { normalizeWhitespace, stripHtml } from "../../shared/text";
import type { HtmlSource } from "../sources/source.schema";
import type { CrawlOptions, RawItem, SourceCrawlResult } from "./ingestion.types";

const resolveLink = (href: string, baseUrl: string): string | null => {
  const trimmed = href.trim();
  if (!trimmed) {
    return null;
  }
  try {
    return new URL(trimmed, baseUrl).toString();
  } catch {
    return null;
  }
};

export const parseHtmlItems = (html: string, source: HtmlSource): RawItem[] => {
  const $ = cheerio.load(html);
  const { selectors } = source;
  const items: RawItem[] = [];

  $(selectors.item).each((_index, element) => {
    const node = $(element);

    const title = normalizeWhitespace(node.find(selectors.title).first().text());

    const linkNode = node.find(selectors.link).first();
    const href = linkNode.attr("href") ?? "";
    const url = resolveLink(href, source.url);

    if (!title || !url) {
      return;
    }

    const summary = selectors.summary
      ? stripHtml(node.find(selectors.summary).first().text())
      : null;

    const dateValue = selectors.date
      ? node.find(selectors.date).first().attr("datetime") ??
        normalizeWhitespace(node.find(selectors.date).first().text())
      : null;

    const author = selectors.author
      ? normalizeWhitespace(node.find(selectors.author).first().text())
      : null;

    items.push({
      sourceId: source.id,
      title,
      url,
      summary: summary || null,
      contentText: summary || null,
      author: author || null,
      publishedAt: dateValue || null,
      language: source.language,
      raw: { html: node.html() ?? "" }
    });
  });

  return items;
};

export const crawlHtmlSource = async (
  source: HtmlSource,
  options: CrawlOptions
): Promise<SourceCrawlResult> => {
  try {
    const html = await fetchText(source.url, options);
    const items = parseHtmlItems(html, source);

    if (items.length === 0) {
      return {
        sourceId: source.id,
        ok: false,
        items: [],
        error: "No items matched the configured selectors."
      };
    }

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
