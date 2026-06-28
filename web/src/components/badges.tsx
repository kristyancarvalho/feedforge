import { useI18n } from "../i18n/I18nProvider";
import type { MatchStrength } from "../lib/matchStrength";
import { isMatchStrength } from "../lib/matchStrength";
import type { SourceHealthLevel } from "../lib/sourceHealth";
import { LanguageIcon } from "./icons";

export function ScoreBadge({ score }: { score: number | null }) {
  const { t } = useI18n();
  const hasScore = typeof score === "number" && Number.isFinite(score);
  const value = hasScore ? Math.round(score as number) : null;
  return (
    <span className="score-badge" data-empty={!hasScore} title={t("scores.finalScore")}>
      <span className="score-value">{value ?? "—"}</span>
      <span className="score-max">/ 100</span>
    </span>
  );
}

export function MatchStrengthBadge({ strength }: { strength: string }) {
  const { t } = useI18n();
  const level: MatchStrength = isMatchStrength(strength) ? strength : "low";
  return (
    <span className="match-badge" data-strength={level}>
      {t(`matchStrength.${level}`)}
    </span>
  );
}

export function LanguageBadge({ language }: { language: string }) {
  return (
    <span className="lang-badge">
      <LanguageIcon className="inline-icon" />
      {language}
    </span>
  );
}

export function SavedStatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const known = ["saved", "idea", "researching", "drafting", "published", "ignored"];
  const label = known.includes(status) ? t(`savedStatus.${status}`) : status;
  return (
    <span className="saved-badge" data-status={status}>
      {label}
    </span>
  );
}

export function SourceHealthBadge({ level }: { level: SourceHealthLevel }) {
  const { t } = useI18n();
  const labelKey =
    level === "healthy"
      ? "sources.healthy"
      : level === "degraded"
        ? "sources.degraded"
        : level === "failing"
          ? "sources.failing"
          : "sources.healthUnknown";
  return (
    <span className="health-badge" data-level={level}>
      {t(labelKey)}
    </span>
  );
}

export function RunStatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const labelKey =
    status === "success"
      ? "runs.statusSuccess"
      : status === "partial_success"
        ? "runs.statusPartial"
        : status === "failed"
          ? "runs.statusFailed"
          : status === "skipped"
            ? "runs.statusSkipped"
            : "runs.statusRunning";
  return (
    <span className="run-status-badge" data-status={status}>
      {t(labelKey)}
    </span>
  );
}
