import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { FilterField } from "../components/FilterBar";
import { FilterBar } from "../components/FilterBar";
import { EditorialControls } from "../components/EditorialControls";
import { LanguageBadge, MatchStrengthBadge, SavedStatusBadge, ScoreBadge } from "../components/badges";
import { EmptyState, ErrorView, Loading } from "../components/StateViews";
import { DateIcon, SourceIcon } from "../components/icons";
import { useInfiniteNews } from "../hooks/useInfiniteNews";
import { paramsToNewsFilters } from "../lib/newsQuery";
import { useI18n } from "../i18n/I18nProvider";
import { formatDate } from "../lib/format";

const SAVED_FIELDS: FilterField[] = [
  "savedStatus",
  "source",
  "topic",
  "language",
  "matchStrength",
  "minScore",
  "sort"
];

export function SavedNewsPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();

  const filters = useMemo(
    () => ({ ...paramsToNewsFilters(searchParams), saved: "true" }),
    [searchParams]
  );

  const news = useInfiniteNews(filters);

  return (
    <div className="section-stack">
      <header className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">{t("saved.title")}</h1>
            <p className="page-subtitle">{t("saved.subtitle")}</p>
          </div>
        </div>
      </header>

      <FilterBar fields={SAVED_FIELDS} locked={{ saved: "true" }} />

      {news.loading ? (
        <Loading />
      ) : news.error && news.items.length === 0 ? (
        <ErrorView message={news.error} onRetry={news.retry} />
      ) : news.items.length === 0 ? (
        <EmptyState message={t("saved.empty")} />
      ) : (
        <>
          <div className="news-grid">
            {news.items.map((item) => (
              <article key={item.id} className="news-card card-reveal">
                <div className="news-card-top">
                  <ScoreBadge score={item.classification?.finalScore ?? null} />
                  {item.classification ? (
                    <MatchStrengthBadge strength={item.classification.matchStrength} />
                  ) : null}
                  {item.saved ? <SavedStatusBadge status={item.saved.status} /> : null}
                </div>
                <h3 className="news-card-title">
                  <Link to={`/news/${item.id}`}>{item.title}</Link>
                </h3>
                <div className="news-card-meta">
                  <span className="meta-item">
                    <SourceIcon className="inline-icon" />
                    {item.source.name}
                  </span>
                  <LanguageBadge language={item.language} />
                  <span className="meta-item">
                    <DateIcon className="inline-icon" />
                    {formatDate(item.publishedAt, t("common.none"))}
                  </span>
                  {item.saved ? (
                    <span className="meta-item dim">
                      {t("saved.savedOn")} {formatDate(item.saved.createdAt, t("common.none"))}
                    </span>
                  ) : null}
                </div>
                {item.summary ? <p className="news-card-summary">{item.summary}</p> : null}
                <EditorialControls
                  item={item}
                  onChange={(next) => {
                    if (next.saved) {
                      news.updateItem(next);
                    } else {
                      news.removeItem(next.id);
                    }
                  }}
                />
              </article>
            ))}
          </div>
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
  );
}
