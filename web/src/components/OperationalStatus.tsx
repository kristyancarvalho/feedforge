import { useEffect } from "react";
import { api } from "../api/client";
import { useI18n } from "../i18n/I18nProvider";
import { useAsync } from "../hooks/useAsync";
import { HelpTooltip } from "./HelpTooltip";

const KNOWN = ["operational", "degraded", "running", "offline", "unknown"];

export function OperationalStatus() {
  const { t } = useI18n();
  const state = useAsync(() => api.getStatus(), []);

  useEffect(() => {
    const id = window.setInterval(() => state.reload(), 30000);
    return () => window.clearInterval(id);
  }, [state]);

  const status = state.data && KNOWN.includes(state.data.status) ? state.data.status : "unknown";
  const description = state.error ? t("status.descriptions.offline") : t(`status.descriptions.${status}`);
  const dotStatus = state.error ? "offline" : status;

  return (
    <span className="operational-status">
      <span className="status-dot" data-status={dotStatus} aria-hidden="true" />
      <span className="status-label">{t(`status.${state.error ? "offline" : status}`)}</span>
      <HelpTooltip label={t("status.label")} text={description} placement="bottom" />
    </span>
  );
}
