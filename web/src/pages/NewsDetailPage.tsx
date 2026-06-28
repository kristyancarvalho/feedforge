import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { NewsItem } from "../api/types";
import { useAsync } from "../hooks/useAsync";
import { useI18n } from "../i18n/I18nProvider";
import { EditorialControls } from "../components/EditorialControls";
import { ScoreBreakdown } from "../components/ScoreBreakdown";
import { LanguageBadge, MatchStrengthBadge, ScoreBadge } from "../components/badges";
import { ErrorView, Loading } from "../components/StateViews";
import { HelpTooltip } from "../components/HelpTooltip";
import {
  DateIcon,
  ExternalLinkIcon,
  KeywordsIcon,
  SourceIcon,
  TopicsIcon
} from "../components/icons";
import { formatDate } from "../lib/format";

function isPenaltyReason(reason: string) {
  return (
    reason.includes("Reduced score") ||
    reason.includes("penalty") ||
    reason.includes("Penalty")
  );
}

export function NewsDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const id = params.id ?? "";
  const state = useAsync(() => api.getNews(id), [id]);
  const [override, setOverride] = useState<NewsItem | null>(null);

  const current = override ?? state.data;

  if (state.loading) {
    return <Loading />;
  }
  if (state.error || !current) {
    return <ErrorView message={state.error ?? t("detail.notFound")} onRetry={state.reload} />;
  }

  const classification = current.classification;
  const topics = classification?.detectedTopics ?? [];
  const keywords = classification?.matchedKeywords ?? [];
  const reasons = classification?.reasons ?? [];
  const penalties = reasons.filter(isPenaltyReason);

  return (
    <div className="section-stack">
      <Link to="/" className="detail-back">
        ← {t("actions.backToRadar")}
      </Link>

      <div className="detail-layout">
        <main className="section-stack">
          <header className="section-stack">
            <h1 className="detail-title">{current.title}</h1>
            <div className="detail-meta">
              <span className="meta-item">
                <SourceIcon className="inline-icon" />
                {current.source.name}
              </span>
              <LanguageBadge language={current.language} />
              <span className="meta-item">
                <DateIcon className="inline-icon" />
                {formatDate(current.publishedAt, t("common.none"))}
                {current.dateInferred ? <span className="dim"> · {t("common.inferredDate")}</span> : null}
              </span>
              {current.author ? (
                <span className="meta-item">
                  {t("common.author")}: {current.author}
                </span>
              ) : null}
              <a className="meta-item" href={current.url} target="_blank" rel="noreferrer">
                <ExternalLinkIcon className="inline-icon" />
                {t("actions.openOriginal")}
              </a>
            </div>
          </header>

          {current.summary ? (
            <section className="panel">
              <h2 className="panel-title">{t("detail.summary")}</h2>
              <p className="prose">{current.summary}</p>
            </section>
          ) : null}

          {current.contentExcerpt ? (
            <section className="panel">
              <h2 className="panel-title">{t("detail.contentExcerpt")}</h2>
              <p className="prose">{current.contentExcerpt}</p>
            </section>
          ) : null}

          {topics.length > 0 ? (
            <section className="panel">
              <h2 className="panel-title">{t("detail.detectedTopics")}</h2>
              <div className="chip-row">
                {topics.map((topic) => (
                  <span key={topic} className="chip">
                    <TopicsIcon className="inline-icon" />
                    {topic}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {keywords.length > 0 ? (
            <section className="panel">
              <h2 className="panel-title">{t("detail.matchedKeywords")}</h2>
              <div className="chip-row">
                {keywords.map((keyword) => (
                  <span key={keyword} className="chip chip-accent">
                    <KeywordsIcon className="inline-icon" />
                    {keyword}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {reasons.length > 0 ? (
            <section className="panel">
              <h2 className="panel-title">{t("detail.reasons")}</h2>
              <ul className="reason-list">
                {reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="panel">
            <h2 className="panel-title">
              {t("detail.penalties")}
              <HelpTooltip label={t("scores.negativePenalty")} text={t("scores.help.negativePenalty")} />
            </h2>
            {penalties.length > 0 ? (
              <ul className="reason-list">
                {penalties.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">{t("detail.noPenalties")}</p>
            )}
          </section>
        </main>

        <aside className="section-stack">
          <section className="panel">
            <div className="detail-score-head">
              <ScoreBadge score={classification?.finalScore ?? null} />
              {classification ? <MatchStrengthBadge strength={classification.matchStrength} /> : null}
            </div>
            <h2 className="panel-title">
              {t("scores.breakdown")}
              <HelpTooltip label={t("scores.finalScore")} text={t("scores.help.finalScore")} />
            </h2>
            {classification ? (
              <ScoreBreakdown classification={classification} />
            ) : (
              <p className="muted">{t("detail.noClassification")}</p>
            )}
          </section>

          <section className="panel">
            <h2 className="panel-title">{t("savedStatus.label")}</h2>
            <EditorialControls item={current} onChange={(next) => setOverride(next)} />
          </section>
        </aside>
      </div>
    </div>
  );
}
