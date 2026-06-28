import type { SourceDefinition } from "../sources/source.schema";
import { crawlHtmlSource } from "./html-ingestion.service";
import { crawlRssSource } from "./rss-ingestion.service";
import type { CrawlOptions, SourceCrawlResult } from "./ingestion.types";

export const crawlSource = async (
  source: SourceDefinition,
  options: CrawlOptions
): Promise<SourceCrawlResult> => {
  if (source.type === "rss") {
    return crawlRssSource(source, options);
  }
  return crawlHtmlSource(source, options);
};
