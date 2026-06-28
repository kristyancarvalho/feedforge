import { useCallback, useMemo, useState } from "react";
import { api } from "../api/client";
import type { CrawlerRunInfo, NewsFilters, NewsItem } from "../api/types";
import { messageFromError, useAsync } from "../hooks/useAsync";
import { NewsCard } from "../components/NewsCard";
import { Pagination } from "../components/Pagination";
import { RunSummary } from "../components/RunSummary";
import { EmptyState, ErrorView, Loading } from "../components/StateViews";

const SORT_OPTIONS = [
  { value: "score", label: "Score (high to low)" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" }
];

interface FilterFormState {
  q: string;
  source: string;
  topic: string;
  language: string;
  status: string;
  saved: string;
  minScore: string;
  sort: string;
}

const EMPTY_FILTERS: FilterFormState = {
  q: "",
  source: "",
  topic: "",
  language: "",
  status: "",
  saved: "",
  minScore: "",
  sort: "score"
};

export const RadarPage = () => {
  const [form, setForm] = useState<FilterFormState>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<FilterFormState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<CrawlerRunInfo | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const filters = useMemo<NewsFilters>(
    () => ({
      q: applied.q || undefined,
      source: applied.source || undefined,
      topic: applied.topic || undefined,
      language: applied.language || undefined,
      status: applied.status || undefined,
      saved: applied.saved || undefined,
      minScore: applied.minScore || undefined,
      sort: applied.sort || undefined,
      page,
      limit: 20
    }),
    [applied, page]
  );

  const news = useAsync(() => api.listNews(filters), [filters]);
  const latest = useAsync(() => api.latestRun(), []);

  const updateItem = useCallback(
    (next: NewsItem) => {
      if (news.data) {
        news.data.data = news.data.data.map((item) =>
          item.id === next.id ? next : item
        );
      }
    },
    [news.data]
  );

  const onSave = async (item: NewsItem) => {
    try {
      updateItem(await api.saveNews(item.id));
      news.reload();
    } catch (cause) {
      setRunError(messageFromError(cause));
    }
  };

  const onUnsave = async (item: NewsItem) => {
    try {
      updateItem(await api.unsaveNews(item.id));
      news.reload();
    } catch (cause) {
      setRunError(messageFromError(cause));
    }
  };

  const applyFilters = () => {
    setPage(1);
    setApplied(form);
  };

  const resetFilters = () => {
    setForm(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  };

  const runCrawler = async () => {
    setRunning(true);
    setRunError(null);
    setRunResult(null);
    try {
      const response = await api.runCrawler();
      setRunResult(response.data);
      news.reload();
      latest.reload();
    } catch (cause) {
      setRunError(messageFromError(cause));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1>Radar</h1>
          <p className="page__subtitle">
            Deterministic signal ranking for open source and technology news.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          disabled={running}
          onClick={runCrawler}
        >
          {running ? "Running crawler…" : "Run crawler and classification"}
        </button>
      </header>

      {runError ? <ErrorView message={runError} /> : null}
      {runResult ? (
        <RunSummary run={runResult} title="Manual run result" />
      ) : latest.data?.data ? (
        <RunSummary run={latest.data.data} title="Latest crawler run" />
      ) : null}

      <section className="filters">
        <input
          className="input"
          placeholder="Search signals"
          value={form.q}
          onChange={(event) => setForm({ ...form, q: event.target.value })}
        />
        <input
          className="input"
          placeholder="Source id"
          value={form.source}
          onChange={(event) => setForm({ ...form, source: event.target.value })}
        />
        <input
          className="input"
          placeholder="Topic"
          value={form.topic}
          onChange={(event) => setForm({ ...form, topic: event.target.value })}
        />
        <select
          className="input"
          value={form.language}
          onChange={(event) => setForm({ ...form, language: event.target.value })}
        >
          <option value="">All languages</option>
          <option value="pt-BR">pt-BR</option>
          <option value="en">en</option>
        </select>
        <input
          className="input"
          type="number"
          min={0}
          max={100}
          placeholder="Min score"
          value={form.minScore}
          onChange={(event) => setForm({ ...form, minScore: event.target.value })}
        />
        <select
          className="input"
          value={form.saved}
          onChange={(event) => setForm({ ...form, saved: event.target.value })}
        >
          <option value="">All items</option>
          <option value="true">Saved only</option>
          <option value="false">Unsaved only</option>
        </select>
        <select
          className="input"
          value={form.sort}
          onChange={(event) => setForm({ ...form, sort: event.target.value })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="filters__actions">
          <button type="button" className="btn btn--accent" onClick={applyFilters}>
            Apply
          </button>
          <button type="button" className="btn btn--ghost" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </section>

      {news.loading ? <Loading label="Loading signals" /> : null}
      {news.error ? <ErrorView message={news.error} onRetry={news.reload} /> : null}

      {news.data && !news.loading && !news.error ? (
        news.data.data.length === 0 ? (
          <EmptyState message="No news collected yet. Run the crawler to start collecting open source signals." />
        ) : (
          <>
            <div className="news-list">
              {news.data.data.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  onSave={onSave}
                  onUnsave={onUnsave}
                />
              ))}
            </div>
            <Pagination
              page={news.data.page}
              totalPages={news.data.totalPages}
              onChange={setPage}
            />
          </>
        )
      ) : null}
    </div>
  );
};
