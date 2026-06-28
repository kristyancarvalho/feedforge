import { Link } from "react-router-dom";
import type { NewsItem } from "../api/types";
import { useI18n } from "../i18n/I18nProvider";
import { formatDate } from "../lib/format";
import {
  DateIcon,
  DetailsIcon,
  ExternalLinkIcon,
  KeywordsIcon,
  SavedIcon,
  SourceIcon,
  TopicsIcon
} from "./icons";
import { LanguageBadge, MatchStrengthBadge, SavedStatusBadge, ScoreBadge } from "./badges";

type Props = {
  item: NewsItem;
  onSave: (item: NewsItem) => void;
  onUnsave: (item: NewsItem) => void;
  busy?: boolean;
};

export function NewsCard({ item, onSave, onUnsave, busy }: Props) {
  const { t } = useI18n();
  const classification = item.classification;
  const topics = classification?.detectedTopics.slice(0, 4) ?? [];
  const keywords = classification?.matchedKeywords.slice(0, 4) ?? [];
  const reasons = classification?.reasons.slice(0, 3) ?? [];
  const saved = item.saved;

  return (
    <article className="news-card card-reveal">
      <div className="news-card-top">
        <ScoreBadge score={classification ? classification.finalScore : null} />
        {classification ? <MatchStrengthBadge strength={classification.matchStrength} /> : null}
        {saved ? <SavedStatusBadge status={saved.status} /> : null}
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
          {item.dateInferred ? <span className="dim"> ({t("common.inferredDate")})</span> : null}
        </span>
      </div>
      {item.summary ? <p className="news-card-summary">{item.summary}</p> : null}
      {topics.length > 0 || keywords.length > 0 ? (
        <div className="chip-row">
          {topics.map((topic) => (
            <span key={`t-${topic}`} className="chip">
              <TopicsIcon className="inline-icon" />
              {topic}
            </span>
          ))}
          {keywords.map((keyword) => (
            <span key={`k-${keyword}`} className="chip chip-accent">
              <KeywordsIcon className="inline-icon" />
              {keyword}
            </span>
          ))}
        </div>
      ) : null}
      {reasons.length > 0 ? (
        <ul className="reason-list">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : null}
      <div className="news-card-actions">
        <a className="button button-ghost" href={item.url} target="_blank" rel="noreferrer">
          <ExternalLinkIcon className="inline-icon" />
          {t("actions.openOriginal")}
        </a>
        <Link className="button button-ghost" to={`/news/${item.id}`}>
          <DetailsIcon className="inline-icon" />
          {t("actions.details")}
        </Link>
        <span className="spacer" />
        {saved ? (
          <button type="button" className="button button-danger" disabled={busy} onClick={() => onUnsave(item)}>
            <SavedIcon className="inline-icon" />
            {t("actions.unsave")}
          </button>
        ) : (
          <button type="button" className="button button-primary" disabled={busy} onClick={() => onSave(item)}>
            <SavedIcon className="inline-icon" />
            {t("actions.save")}
          </button>
        )}
      </div>
    </article>
  );
}
