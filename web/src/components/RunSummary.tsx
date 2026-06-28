import type { CrawlerRunInfo } from "../api/types";
import { formatDate, formatDuration } from "../lib/format";
import { RunStatusBadge } from "./badges";

interface Stat {
  label: string;
  value: number | string;
}

export const RunSummary = ({
  run,
  title
}: {
  run: CrawlerRunInfo;
  title: string;
}) => {
  const stats: Stat[] = [
    { label: "Sources", value: `${run.successfulSources}/${run.totalSources}` },
    { label: "Failed", value: run.failedSources },
    { label: "Found", value: run.itemsFound },
    { label: "Created", value: run.itemsCreated },
    { label: "Updated", value: run.itemsUpdated },
    { label: "Skipped", value: run.itemsSkipped }
  ];

  return (
    <div className="run-summary">
      <div className="run-summary__head">
        <span className="run-summary__title">{title}</span>
        <RunStatusBadge status={run.status} />
        <span className="run-summary__trigger">{run.trigger}</span>
        <span className="run-summary__time">
          {formatDate(run.startedAt)} · {formatDuration(run.durationMs)}
        </span>
      </div>
      <div className="run-summary__stats">
        {stats.map((stat) => (
          <div key={stat.label} className="run-summary__stat">
            <span className="run-summary__value">{stat.value}</span>
            <span className="run-summary__label">{stat.label}</span>
          </div>
        ))}
      </div>
      {run.errorMessage ? (
        <p className="run-summary__error">{run.errorMessage}</p>
      ) : null}
    </div>
  );
};
