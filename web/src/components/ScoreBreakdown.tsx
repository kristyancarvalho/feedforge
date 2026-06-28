import type { Classification } from "../api/types";

interface Row {
  label: string;
  value: number;
  weight: string;
}

const buildRows = (classification: Classification): Row[] => [
  { label: "Topics", value: classification.topicScore, weight: "35%" },
  { label: "Keywords", value: classification.keywordScore, weight: "25%" },
  { label: "Source", value: classification.sourceScore, weight: "15%" },
  { label: "Freshness", value: classification.freshnessScore, weight: "15%" },
  { label: "Novelty", value: classification.noveltyScore, weight: "10%" }
];

export const ScoreBreakdown = ({
  classification
}: {
  classification: Classification;
}) => {
  const rows = buildRows(classification);
  return (
    <div className="breakdown">
      {rows.map((row) => (
        <div key={row.label} className="breakdown__row">
          <div className="breakdown__head">
            <span>{row.label}</span>
            <span className="breakdown__weight">{row.weight}</span>
          </div>
          <div className="breakdown__bar">
            <span
              className="breakdown__fill"
              style={{ width: `${Math.max(0, Math.min(100, row.value))}%` }}
            />
          </div>
          <span className="breakdown__value">{Math.round(row.value)}</span>
        </div>
      ))}
      <div className="breakdown__row breakdown__row--penalty">
        <div className="breakdown__head">
          <span>Negative penalty</span>
        </div>
        <span className="breakdown__value">
          −{Math.round(classification.negativePenalty)}
        </span>
      </div>
    </div>
  );
};
