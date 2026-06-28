import type { Classification } from "../api/types";
import { useI18n } from "../i18n/I18nProvider";
import { HelpTooltip } from "./HelpTooltip";

type ScoreKey =
  | "topicScore"
  | "keywordScore"
  | "technicalDepthScore"
  | "openSourceRelevanceScore"
  | "sourceScore"
  | "freshnessScore"
  | "noveltyScore";

const POSITIVE_KEYS: ScoreKey[] = [
  "topicScore",
  "keywordScore",
  "technicalDepthScore",
  "openSourceRelevanceScore",
  "sourceScore",
  "freshnessScore",
  "noveltyScore"
];

export function ScoreBreakdown({ classification }: { classification: Classification }) {
  const { t } = useI18n();

  return (
    <div className="score-breakdown">
      {POSITIVE_KEYS.map((key) => (
        <Row
          key={key}
          label={t(`scores.${key}`)}
          help={t(`scores.help.${key}`)}
          value={classification[key]}
        />
      ))}
      <Row
        label={t("scores.negativePenalty")}
        help={t("scores.help.negativePenalty")}
        value={classification.negativePenalty}
        negative
      />
    </div>
  );
}

function Row({
  label,
  help,
  value,
  negative = false
}: {
  label: string;
  help: string;
  value: number;
  negative?: boolean;
}) {
  const width = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="score-row">
      <span className="score-row-label">
        {label}
        <HelpTooltip label={label} text={help} />
      </span>
      <span className="score-bar" aria-hidden="true">
        <span className="score-bar-fill" data-negative={negative} style={{ width: `${width}%` }} />
      </span>
      <span className="score-row-value">{Math.round(value)}</span>
    </div>
  );
}
