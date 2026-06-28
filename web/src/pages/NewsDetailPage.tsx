import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { NewsItem } from "../api/types";
import { useAsync } from "../hooks/useAsync";
import { EditorialControls } from "../components/EditorialControls";
import { ScoreBreakdown } from "../components/ScoreBreakdown";
import { LanguageBadge, ScoreBadge } from "../components/badges";
import { ErrorView, Loading } from "../components/StateViews";
import { formatDate } from "../lib/format";

export const NewsDetailPage = () => {
  const params = useParams();
  const id = params.id ?? "";
  const state = useAsync(() => api.getNews(id), [id]);
  const [item, setItem] = useState<NewsItem | null>(null);

  const current = item ?? state.data;

  if (state.loading) {
    return <Loading label="Loading signal" />;
  }
  if (state.error || !current) {
    return (
      <ErrorView message={state.error ?? "News item not found."} onRetry={state.reload} />
    );
  }

  const classification = current.classification;
  const topics = classification?.detectedTopics ?? [];
  const keywords = classification?.matchedKeywords ?? [];
  const reasons = classification?.reasons ?? [];

  return (
    <div className="page detail">
      <Link to="/" className="detail__back">
        ← Back to Radar
      </Link>

      <header className="detail__header">
        <ScoreBadge score={classification?.finalScore ?? null} />
        <div>
          <h1>{current.title}</h1>
          <div className="card__meta">
            <span className="card__source">{current.source.name}</span>
            <LanguageBadge language={current.language} />
            <span>{formatDate(current.publishedAt)}</span>
            {current.author ? <span>by {current.author}</span> : null}
          </div>
          <a
            className="detail__url"
            href={current.url}
            target="_blank"
            rel="noreferrer"
          >
            {current.url}
          </a>
        </div>
      </header>

      <div className="detail__grid">
        <section className="detail__main">
          {current.summary ? (
            <div className="panel">
              <h2>Summary</h2>
              <p>{current.summary}</p>
            </div>
          ) : null}

          {current.contentExcerpt ? (
            <div className="panel">
              <h2>Content excerpt</h2>
              <p>{current.contentExcerpt}</p>
            </div>
          ) : null}

          <div className="panel">
            <h2>Editorial Status</h2>
            <EditorialControls
              item={current}
              onChange={(next) => {
                setItem(next);
              }}
            />
          </div>
        </section>

        <aside className="detail__aside">
          {classification ? (
            <div className="panel">
              <h2>Score Breakdown</h2>
              <ScoreBreakdown classification={classification} />
            </div>
          ) : (
            <div className="panel">
              <h2>Score Breakdown</h2>
              <p className="muted">This item has not been classified yet.</p>
            </div>
          )}

          {topics.length > 0 ? (
            <div className="panel">
              <h2>Detected Topics</h2>
              <div className="tags">
                {topics.map((topic) => (
                  <span key={topic} className="tag tag--topic">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {keywords.length > 0 ? (
            <div className="panel">
              <h2>Matched Keywords</h2>
              <div className="tags">
                {keywords.map((keyword) => (
                  <span key={keyword} className="tag tag--keyword">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {reasons.length > 0 ? (
            <div className="panel">
              <h2>Classification Reasons</h2>
              <ul className="reasons">
                {reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
};
