import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import type { RunFilters } from "../api/types";
import { messageFromError, useAsync } from "../hooks/useAsync";
import { useI18n } from "../i18n/I18nProvider";
import { RunStatusBadge } from "../components/badges";
import { RunSummary } from "../components/RunSummary";
import { Pagination } from "../components/Pagination";
import { EmptyState, ErrorView, Loading } from "../components/StateViews";
import { HelpTooltip } from "../components/HelpTooltip";
import { ManualIcon } from "../components/icons";
import { formatDate, formatDuration } from "../lib/format";

const RUN_LIMIT = "20";

function paramsToRunFilters(params: URLSearchParams): RunFilters {
  const filters: RunFilters = { limit: RUN_LIMIT };
  const trigger = params.get("trigger");
  const status = params.get("status");
  const startedFrom = params.get("startedFrom");
  const startedTo = params.get("startedTo");
  const page = params.get("page");
  if (trigger) filters.trigger = trigger;
  if (status) filters.status = status;
  if (startedFrom) filters.startedFrom = startedFrom;
  if (startedTo) filters.startedTo = startedTo;
  if (page) filters.page = page;
  return filters;
}

export function RunsPage() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const key = searchParams.toString();

  const filters = useMemo(() => paramsToRunFilters(searchParams), [searchParams]);

  const runs = useAsync(() => api.listRuns(filters), [key]);
  const latest = useAsync(() => api.latestRun(), []);

  const [draft, setDraft] = useState({
    trigger: searchParams.get("trigger") ?? "",
    status: searchParams.get("status") ?? "",
    startedFrom: searchParams.get("startedFrom") ?? "",
    startedTo: searchParams.get("startedTo") ?? ""
  });

  const [busy, setBusy] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const latestRun = latest.data?.data ?? null;
  const active = latestRun?.status === "running";

  function apply(event: React.FormEvent) {
    event.preventDefault();
    const next = new URLSearchParams();
    if (draft.trigger) next.set("trigger", draft.trigger);
    if (draft.status) next.set("status", draft.status);
    if (draft.startedFrom) next.set("startedFrom", draft.startedFrom);
    if (draft.startedTo) next.set("startedTo", draft.startedTo);
    setSearchParams(next, { replace: true });
  }

  function reset() {
    setDraft({ trigger: "", status: "", startedFrom: "", startedTo: "" });
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  function goToPage(page: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next, { replace: true });
  }

  async function triggerCrawler() {
    setBusy(true);
    setRunError(null);
    try {
      await api.runCrawler();
      latest.reload();
      runs.reload();
    } catch (cause) {
      setRunError(messageFromError(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="section-stack">
      <header className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">{t("runs.title")}</h1>
            <p className="page-subtitle">{t("runs.subtitle")}</p>
          </div>
          <div className="page-header-actions">
            <HelpTooltip label={t("actions.runCrawler")} text={t("runs.help.manualCrawler")} />
            <button
              type="button"
              className="button button-primary"
              disabled={busy || active}
              onClick={triggerCrawler}
            >
              <ManualIcon className="inline-icon" />
              {busy || active ? t("actions.running") : t("actions.runCrawler")}
            </button>
          </div>
        </div>
      </header>

      {runError ? <ErrorView message={runError} /> : null}

      {latestRun ? <RunSummary run={latestRun} title={t("runs.latestRun")} /> : null}

      <form className="filter-bar" onSubmit={apply}>
        <div className="filter-bar-head">
          <span className="filter-bar-title">{t("filters.title")}</span>
          <div className="filter-bar-actions">
            <button type="submit" className="button button-primary">
              {t("actions.apply")}
            </button>
            <button type="button" className="button button-ghost" onClick={reset}>
              {t("actions.reset")}
            </button>
          </div>
        </div>
        <div className="filter-grid">
          <label className="filter-field">
            <span className="filter-label">{t("runs.trigger")}</span>
            <select
              className="select"
              value={draft.trigger}
              onChange={(e) => setDraft((prev) => ({ ...prev, trigger: e.target.value }))}
            >
              <option value="">{t("common.all")}</option>
              <option value="manual">{t("runs.triggerManual")}</option>
              <option value="cron">{t("runs.triggerCron")}</option>
              <option value="startup">{t("runs.triggerStartup")}</option>
            </select>
          </label>
          <label className="filter-field">
            <span className="filter-label">{t("runs.status")}</span>
            <select
              className="select"
              value={draft.status}
              onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="">{t("common.all")}</option>
              <option value="success">{t("runs.statusSuccess")}</option>
              <option value="partial_success">{t("runs.statusPartial")}</option>
              <option value="failed">{t("runs.statusFailed")}</option>
              <option value="skipped">{t("runs.statusSkipped")}</option>
              <option value="running">{t("runs.statusRunning")}</option>
            </select>
          </label>
          <label className="filter-field">
            <span className="filter-label">{t("runs.started")}</span>
            <input
              className="input"
              type="date"
              value={draft.startedFrom}
              onChange={(e) => setDraft((prev) => ({ ...prev, startedFrom: e.target.value }))}
            />
          </label>
          <label className="filter-field">
            <span className="filter-label">{t("runs.finished")}</span>
            <input
              className="input"
              type="date"
              value={draft.startedTo}
              onChange={(e) => setDraft((prev) => ({ ...prev, startedTo: e.target.value }))}
            />
          </label>
        </div>
      </form>

      {runs.loading ? <Loading /> : null}
      {runs.error ? <ErrorView message={runs.error} onRetry={runs.reload} /> : null}

      {runs.data && !runs.loading && !runs.error ? (
        runs.data.data.length === 0 ? (
          <EmptyState message={t("runs.empty")} />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("runs.status")}</th>
                    <th>{t("runs.trigger")}</th>
                    <th>{t("runs.started")}</th>
                    <th>{t("runs.duration")}</th>
                    <th>{t("runs.successfulSources")}</th>
                    <th>{t("runs.failedSources")}</th>
                    <th>{t("runs.itemsFound")}</th>
                    <th>{t("runs.itemsCreated")}</th>
                    <th>{t("runs.itemsUpdated")}</th>
                    <th>{t("runs.itemsSkipped")}</th>
                    <th>{t("runs.error")}</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.data.data.map((run) => (
                    <tr key={run.id}>
                      <td>
                        <RunStatusBadge status={run.status} />
                      </td>
                      <td>{run.trigger}</td>
                      <td>{formatDate(run.startedAt)}</td>
                      <td>{formatDuration(run.durationMs)}</td>
                      <td>
                        {run.successfulSources}/{run.totalSources}
                      </td>
                      <td>{run.failedSources}</td>
                      <td>{run.itemsFound}</td>
                      <td>{run.itemsCreated}</td>
                      <td>{run.itemsUpdated}</td>
                      <td>{run.itemsSkipped}</td>
                      <td>
                        {run.errorMessage ? (
                          run.errorMessage
                        ) : (
                          <span className="dim">{t("sources.noError")}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={runs.data.page}
              totalPages={runs.data.totalPages}
              onChange={goToPage}
            />
          </>
        )
      ) : null}
    </div>
  );
}
