import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { SAVED_STATUSES, type NewsFilters, type NewsItem } from "../api/types";
import { useAsync } from "../hooks/useAsync";
import { EditorialControls } from "../components/EditorialControls";
import { LanguageBadge, ScoreBadge } from "../components/badges";
import { Pagination } from "../components/Pagination";
import { EmptyState, ErrorView, Loading } from "../components/StateViews";
import { formatDate } from "../lib/format";

interface SavedFilterState {
  status: string;
  source: string;
  topic: string;
  language: string;
  minScore: string;
}

const EMPTY: SavedFilterState = {
  status: "",
  source: "",
  topic: "",
  language: "",
  minScore: ""
};

export const SavedNewsPage = () => {
  const [form, setForm] = useState<SavedFilterState>(EMPTY);
  const [applied, setApplied] = useState<SavedFilterState>(EMPTY);
  const [page, setPage] = useState(1);

  const filters = useMemo<NewsFilters>(
    () => ({
      saved: "true",
      status: applied.status || undefined,
      source: applied.source || undefined,
      topic: applied.topic || undefined,
      language: applied.language || undefined,
      minScore: applied.minScore || undefined,
      page,
      limit: 20
    }),
    [applied, page]
  );

  const state = useAsync(() => api.listNews(filters), [filters]);

  const onChange = (next: NewsItem) => {
    if (next.saved === null) {
      state.reload();
      return;
    }
    if (state.data) {
      state.data.data = state.data.data.map((item) =>
        item.id === next.id ? next : item
      );
    }
  };

  const apply = () => {
    setPage(1);
    setApplied(form);
  };

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1>Saved News</h1>
          <p className="page__subtitle">Editorial workflow for promising signals.</p>
        </div>
      </header>

      <section className="filters">
        <select
          className="input"
          value={form.status}
          onChange={(event) => setForm({ ...form, status: event.target.value })}
        >
          <option value="">All statuses</option>
          {SAVED_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
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
        <div className="filters__actions">
          <button type="button" className="btn btn--accent" onClick={apply}>
            Apply
          </button>
        </div>
      </section>

      {state.loading ? <Loading label="Loading saved news" /> : null}
      {state.error ? <ErrorView message={state.error} onRetry={state.reload} /> : null}

      {state.data && !state.loading && !state.error ? (
        state.data.data.length === 0 ? (
          <EmptyState message="No saved news yet. Save promising items from the Radar page." />
        ) : (
          <>
            <div className="saved-list">
              {state.data.data.map((item) => (
                <article key={item.id} className="saved-card">
                  <div className="saved-card__top">
                    <ScoreBadge score={item.classification?.finalScore ?? null} />
                    <div className="saved-card__headline">
                      <Link to={`/news/${item.id}`} className="card__title">
                        {item.title}
                      </Link>
                      <div className="card__meta">
                        <span className="card__source">{item.source.name}</span>
                        <LanguageBadge language={item.language} />
                        <span>Published {formatDate(item.publishedAt)}</span>
                        {item.saved ? (
                          <span>Saved {formatDate(item.saved.createdAt)}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <EditorialControls item={item} onChange={onChange} />
                </article>
              ))}
            </div>
            <Pagination
              page={state.data.page}
              totalPages={state.data.totalPages}
              onChange={setPage}
            />
          </>
        )
      ) : null}
    </div>
  );
};
