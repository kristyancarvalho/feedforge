import { useI18n } from "../i18n/I18nProvider";

export function Loading({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <div className="state-view" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label ?? t("common.loading")}</span>
    </div>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="state-view" role="alert">
      <span>{message}</span>
      {onRetry ? (
        <button type="button" className="button button-ghost" onClick={onRetry}>
          {t("actions.retry")}
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="state-view empty-state">
      <span>{message}</span>
    </div>
  );
}
