import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import type { CrawlerRunInfo, NewsItem } from "../api/types";
import { FilterBar, type FilterField } from "../components/FilterBar";
import { HelpTooltip } from "../components/HelpTooltip";
import { ManualIcon } from "../components/icons";
import { NewsGrid } from "../components/NewsGrid";
import { RunSummary } from "../components/RunSummary";
import { EmptyState, ErrorView, Loading } from "../components/StateViews";
import { useAsync, messageFromError } from "../hooks/useAsync";
import { useInfiniteNews } from "../hooks/useInfiniteNews";
import { useI18n } from "../i18n/I18nProvider";
import { paramsToNewsFilters } from "../lib/newsQuery";

const RADAR_FIELDS: FilterField[] = [
  "q",
  "source",
  "sourceType",
  "topic",
  "keyword",
  "language",
  "matchStrength",
  "minScore",
  "maxScore",
  "savedState",
  "publishedFrom",
  "publishedTo",
  "hasSummary",
  "hasReasons",
  "hasNegativePenalty",
  "sort"
];

export function RadarPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const filters = paramsToNewsFilters(searchParams);

  const news = useInfiniteNews(filters);
  const latest = useAsync<{ data: CrawlerRunInfo | null }>(() => api.latestRun(), []);
  const status = useAsync(() => api.getStatus(), []);

  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<CrawlerRunInfo | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const crawlerActive = status.data?.crawler.active ?? false;

  const runCrawler = useCallback(async () => {
    setRunning(true);
    setRunError(null);
    try {
      const result = await api.runCrawler();
      setRunResult(result.data);
      news.refresh();
      latest.reload();
      status.reload();
    } catch (error) {
      setRunError(messageFromError(error));
    } finally {
      setRunning(false);
    }
  }, [news, latest, status]);

  const onSave = useCallback(
    async (item: NewsItem) => {
      const updated = await api.saveNews(item.id);
      news.updateItem(updated);
    },
    [news]
  );

  const onUnsave = useCallback(
    async (item: NewsItem) => {
      const updated = await api.unsaveNews(item.id);
      news.updateItem(updated);
    },
    [news]
  );

  const summaryRun = runResult ?? latest.data?.data ?? null;

  return (
    <div className="section-stack">
      <header className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">{t("radar.title")}</h1>
            <p className="page-subtitle">{t("radar.subtitle")}</p>
          </div>
          <div className="page-header-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={runCrawler}
              disabled={running || crawlerActive}
            >
              <ManualIcon className="inline-icon" />
              {running || crawlerActive ? t("actions.running") : t("actions.runCrawler")}
            </button>
            <HelpTooltip label={t("actions.runCrawler")} text={t("radar.manualHelp")} />
          </div>
        </div>
      </header>

      {runError ? <ErrorView message={runError} /> : null}
      {summaryRun ? <RunSummary run={summaryRun} title={t("runs.latestRun")} /> : null}

      <div className="radar-layout">
        <div className="radar-main">
          {news.loading ? (
            <Loading />
          ) : news.error && news.items.length === 0 ? (
            <ErrorView message={news.error} onRetry={news.retry} />
          ) : news.items.length === 0 ? (
            <EmptyState message={t("radar.empty")} />
          ) : (
            <>
              <NewsGrid items={news.items} onSave={onSave} onUnsave={onUnsave} />
              <div ref={news.sentinelRef} className="sentinel" />
              <div className="infinite-footer">
                {news.loadingMore ? (
                  <Loading />
                ) : news.error ? (
                  <ErrorView message={t("common.loadMoreError")} onRetry={news.retry} />
                ) : !news.hasMore ? (
                  <span className="dim">{t("common.endOfResults")}</span>
                ) : null}
              </div>
            </>
          )}
        </div>
        <aside className="radar-aside">
          <FilterBar fields={RADAR_FIELDS} variant="aside" />
        </aside>
      </div>
    </div>
  );
}
