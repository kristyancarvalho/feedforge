const scoreTier = (score: number): string => {
  if (score >= 75) {
    return "score--high";
  }
  if (score >= 50) {
    return "score--mid";
  }
  if (score >= 25) {
    return "score--low";
  }
  return "score--weak";
};

export const ScoreBadge = ({ score }: { score: number | null }) => {
  if (score === null) {
    return <span className="score score--none">—</span>;
  }
  return (
    <span className={`score ${scoreTier(score)}`}>{Math.round(score)}</span>
  );
};

export const LanguageBadge = ({ language }: { language: string }) => (
  <span className="badge badge--language">{language}</span>
);

export const StatusBadge = ({ status }: { status: string }) => (
  <span className={`badge badge--status status--${status}`}>{status}</span>
);

const runStatusLabel: Record<string, string> = {
  running: "running",
  success: "success",
  partial_success: "partial",
  failed: "failed",
  skipped: "skipped"
};

export const RunStatusBadge = ({ status }: { status: string }) => (
  <span className={`badge badge--run run--${status}`}>
    {runStatusLabel[status] ?? status}
  </span>
);
