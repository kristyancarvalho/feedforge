import { useState } from "react";
import { api } from "../api/client";
import { messageFromError, useAsync } from "../hooks/useAsync";
import { useI18n } from "../i18n/I18nProvider";
import { LanguageBadge, SourceHealthBadge } from "../components/badges";
import { EmptyState, ErrorView, Loading } from "../components/StateViews";
import { HelpTooltip } from "../components/HelpTooltip";
import { ExternalLinkIcon, ReloadIcon } from "../components/icons";
import { sourceHealthLevel } from "../lib/sourceHealth";
import { formatDate } from "../lib/format";

export function SourcesPage() {
  const { t } = useI18n();
  const state = useAsync(() => api.listSources(), []);
  const [reloading, setReloading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setReloading(true);
    setMessage(null);
    setError(null);
    try {
      const result = await api.reloadSources();
      const synced = result.data;
      setMessage(`${synced.total} · +${synced.created} · ~${synced.updated}`);
      state.reload();
    } catch (cause) {
      setError(messageFromError(cause));
    } finally {
      setReloading(false);
    }
  };

  return (
    <div className="section-stack">
      <header className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">{t("sources.title")}</h1>
            <p className="page-subtitle">{t("sources.subtitle")}</p>
          </div>
          <div className="page-header-actions">
            {message ? <span className="dim">{message}</span> : null}
            <button type="button" className="button button-primary" disabled={reloading} onClick={reload}>
              <ReloadIcon className="inline-icon" />
              {reloading ? t("actions.running") : t("actions.reloadSources")}
            </button>
          </div>
        </div>
      </header>

      {error ? <ErrorView message={error} /> : null}

      {state.loading ? <Loading /> : null}
      {state.error ? <ErrorView message={state.error} onRetry={state.reload} /> : null}

      {state.data && !state.loading && !state.error ? (
        state.data.data.length === 0 ? (
          <EmptyState message={t("sources.empty")} />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("common.source")}</th>
                  <th>{t("sources.type")}</th>
                  <th>{t("sources.language")}</th>
                  <th>
                    {t("sources.weight")}
                    <HelpTooltip label={t("sources.weight")} text={t("sources.help.weight")} />
                  </th>
                  <th>
                    {t("sources.enabled")}
                    <HelpTooltip label={t("sources.enabled")} text={t("sources.help.enabled")} />
                  </th>
                  <th>
                    {t("sources.health")}
                    <HelpTooltip label={t("sources.health")} text={t("sources.help.health")} />
                  </th>
                  <th>{t("sources.itemsCollected")}</th>
                  <th>{t("sources.lastRun")}</th>
                  <th>{t("sources.lastSuccess")}</th>
                  <th>
                    {t("sources.lastError")}
                    <HelpTooltip label={t("sources.lastError")} text={t("sources.help.lastError")} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {state.data.data.map((source) => (
                  <tr key={source.id}>
                    <td className="source-name-cell">
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.name}
                        <ExternalLinkIcon className="inline-icon" />
                      </a>
                      {source.tags.length > 0 ? (
                        <div className="tag-list">
                          {source.tags.map((tag) => (
                            <span key={tag} className="chip">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </td>
                    <td>{source.type}</td>
                    <td>
                      <LanguageBadge language={source.language} />
                    </td>
                    <td>{source.weight}</td>
                    <td>{source.enabled ? t("sources.enabled") : t("sources.disabled")}</td>
                    <td>
                      <SourceHealthBadge level={sourceHealthLevel(source)} />
                    </td>
                    <td>{source.itemsCollected}</td>
                    <td>{formatDate(source.lastRunAt, t("sources.never"))}</td>
                    <td>{formatDate(source.lastSuccessAt, t("sources.never"))}</td>
                    <td>{source.lastError ? source.lastError : <span className="dim">{t("sources.noError")}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  );
}
