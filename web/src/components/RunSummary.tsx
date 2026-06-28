import { CrawlerRunInfo } from "../api/types";
import { useI18n } from "../i18n/I18nProvider";
import { formatDate, formatDuration } from "../lib/format";
import { RunStatusBadge } from "./badges";
import { CronIcon, ManualIcon } from "./icons";

const TRIGGER_LABEL: Record<string, string> = {
  manual: "runs.triggerManual",
  cron: "runs.triggerCron",
  startup: "runs.triggerStartup"
};

export function RunSummary({ run, title }: { run: CrawlerRunInfo; title?: string }) {
  const { t } = useI18n();
  const triggerKey = TRIGGER_LABEL[run.trigger] ?? "runs.trigger";
  const TriggerIcon = run.trigger === "manual" ? ManualIcon : CronIcon;

  const metrics: Array<{ label: string; value: string | number }> = [
    { label: t("runs.totalSources"), value: run.totalSources },
    { label: t("runs.successfulSources"), value: run.successfulSources },
    { label: t("runs.failedSources"), value: run.failedSources },
    { label: t("runs.itemsFound"), value: run.itemsFound },
    { label: t("runs.itemsCreated"), value: run.itemsCreated },
    { label: t("runs.itemsUpdated"), value: run.itemsUpdated },
    { label: t("runs.itemsSkipped"), value: run.itemsSkipped },
    { label: t("runs.duration"), value: formatDuration(run.durationMs) }
  ];

  return (
    <section className="run-summary">
      <div className="run-summary-head">
        {title ? <strong>{title}</strong> : null}
        <RunStatusBadge status={run.status} />
        <span className="meta-item">
          <TriggerIcon className="inline-icon" />
          {t(triggerKey)}
        </span>
        <span className="dim">{formatDate(run.startedAt)}</span>
      </div>
      <div className="run-metrics">
        {metrics.map((metric) => (
          <div className="metric" key={metric.label}>
            <span className="metric-value">{metric.value}</span>
            <span className="metric-label">{metric.label}</span>
          </div>
        ))}
      </div>
      {run.errorMessage ? <p className="error-text">{run.errorMessage}</p> : null}
    </section>
  );
}
