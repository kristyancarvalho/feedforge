import { useState } from "react";
import { api } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import { RunStatusBadge } from "../components/badges";
import { Pagination } from "../components/Pagination";
import { EmptyState, ErrorView, Loading } from "../components/StateViews";
import { formatDate, formatDuration } from "../lib/format";

export const RunsPage = () => {
  const [page, setPage] = useState(1);
  const state = useAsync(() => api.listRuns(page, 20), [page]);

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1>Crawler Runs</h1>
          <p className="page__subtitle">Execution history and run health.</p>
        </div>
      </header>

      {state.loading ? <Loading label="Loading runs" /> : null}
      {state.error ? <ErrorView message={state.error} onRetry={state.reload} /> : null}

      {state.data && !state.loading && !state.error ? (
        state.data.data.length === 0 ? (
          <EmptyState message="No crawler runs yet. Run the crawler manually or enable cron." />
        ) : (
          <>
            <div className="runs-table">
              <div className="runs-table__head">
                <span>Status</span>
                <span>Trigger</span>
                <span>Started</span>
                <span>Duration</span>
                <span>Sources</span>
                <span>Found</span>
                <span>Created</span>
                <span>Updated</span>
                <span>Skipped</span>
              </div>
              {state.data.data.map((run) => (
                <div key={run.id} className="runs-table__row">
                  <span>
                    <RunStatusBadge status={run.status} />
                  </span>
                  <span>{run.trigger}</span>
                  <span>{formatDate(run.startedAt)}</span>
                  <span>{formatDuration(run.durationMs)}</span>
                  <span>
                    {run.successfulSources}/{run.totalSources}
                    {run.failedSources > 0 ? ` (${run.failedSources} failed)` : ""}
                  </span>
                  <span>{run.itemsFound}</span>
                  <span>{run.itemsCreated}</span>
                  <span>{run.itemsUpdated}</span>
                  <span>{run.itemsSkipped}</span>
                  {run.errorMessage ? (
                    <span className="runs-table__error">{run.errorMessage}</span>
                  ) : null}
                </div>
              ))}
            </div>
            <Pagination
              page={state.data.page}
              totalPages={state.data.totalPages}
              onChange={setPage}
            />
          </>
        )
      ) : null}
    </div>
  );
};
