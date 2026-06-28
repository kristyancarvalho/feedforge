import { Link } from "react-router-dom";
import type { NewsItem } from "../api/types";
import { formatDate } from "../lib/format";
import { LanguageBadge, ScoreBadge, StatusBadge } from "./badges";

interface Props {
  item: NewsItem;
  onSave: (item: NewsItem) => void;
  onUnsave: (item: NewsItem) => void;
}

export const NewsCard = ({ item, onSave, onUnsave }: Props) => {
  const topics = item.classification?.detectedTopics ?? [];
  const keywords = item.classification?.matchedKeywords ?? [];

  return (
    <article className="card">
      <div className="card__score">
        <ScoreBadge score={item.classification?.finalScore ?? null} />
      </div>

      <div className="card__body">
        <div className="card__heading">
          <Link to={`/news/${item.id}`} className="card__title">
            {item.title}
          </Link>
          {item.saved ? <StatusBadge status={item.saved.status} /> : null}
        </div>

        <div className="card__meta">
          <span className="card__source">{item.source.name}</span>
          <LanguageBadge language={item.language} />
          <span>{formatDate(item.publishedAt)}</span>
        </div>

        {item.summary ? <p className="card__summary">{item.summary}</p> : null}

        {topics.length > 0 ? (
          <div className="tags">
            {topics.slice(0, 6).map((topic) => (
              <span key={topic} className="tag tag--topic">
                {topic}
              </span>
            ))}
          </div>
        ) : null}

        {keywords.length > 0 ? (
          <div className="tags">
            {keywords.slice(0, 6).map((keyword) => (
              <span key={keyword} className="tag tag--keyword">
                {keyword}
              </span>
            ))}
          </div>
        ) : null}

        <div className="card__actions">
          <a
            className="btn btn--ghost"
            href={item.url}
            target="_blank"
            rel="noreferrer"
          >
            Open original
          </a>
          <Link className="btn btn--ghost" to={`/news/${item.id}`}>
            Details
          </Link>
          {item.saved ? (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => onUnsave(item)}
            >
              Unsave
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--accent"
              onClick={() => onSave(item)}
            >
              Save
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
