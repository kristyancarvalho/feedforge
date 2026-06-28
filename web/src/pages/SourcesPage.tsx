import { useState } from "react";
import { api } from "../api/client";
import { messageFromError, useAsync } from "../hooks/useAsync";
import { LanguageBadge } from "../components/badges";
import { EmptyState, ErrorView, Loading } from "../components/StateViews";
import { formatDate } from "../lib/format";

export const SourcesPage = () => {
  const state = useAsync(() => api.listSources(), []);
  const [reloading, setReloading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setReloading(true);
    setMessage(null);
    setError(null);
    try {
      const result = await api.reloadSources();
      setMessage(
        `Synced ${result.total} sources (${result.created} created, ${result.updated} updated).`
      );
      state.reload();
    } catch (cause) {
      setError(messageFromError(cause));
    } finally {
      setReloading(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1>Sources</h1>
          <p className="page__subtitle">Source health and ingestion status.</p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          disabled={reloading}
          onClick={reload}
        >
          {reloading ? "Reloading…" : "Reload sources"}
        </button>
      </header>

      {message ? <div className="notice notice--ok">{message}</div> : null}
      {error ? <ErrorView message={error} /> : null}

      {state.loading ? <Loading label="Loading sources" /> : null}
      {state.error ? <ErrorView message={state.error} onRetry={state.reload} /> : null}

      {state.data && !state.loading && !state.error ? (
        state.data.data.length === 0 ? (
          <EmptyState message="No sources found. Check sources.json and reload sources." />
        ) : (
          <div className="source-list">
            {state.data.data.map((source) => (
              <article
                key={source.id}
                className={`source-card ${source.enabled ? "" : "source-card--disabled"}`}
              >
                <div className="source-card__head">
                  <div>
                    <strong>{source.name}</strong>
                    <div className="source-card__meta">
                      <span className="badge badge--type">{source.type}</span>
                      <LanguageBadge language={source.language} />
                      <span className="badge badge--weight">w{source.weight}</span>
                      <span
                        className={`badge ${
                          source.enabled ? "badge--enabled" : "badge--disabled"
                        }`}
                      >
                        {source.enabled ? "enabled" : "disabled"}
                      </span>
                    </div>
                  </div>
                  <span className="source-card__count">
                    {source.itemsCollected} items
                  </span>
                </div>

                <a
                  className="source-card__url"
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.url}
                </a>

                {source.tags.length > 0 ? (
                  <div className="tags">
                    {source.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="source-card__status">
                  <span>Last run: {formatDate(source.lastRunAt)}</span>
                  <span>Last success: {formatDate(source.lastSuccessAt)}</span>
                </div>

                {source.lastError ? (
                  <p className="source-card__error">{source.lastError}</p>
                ) : null}
              </article>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
};
