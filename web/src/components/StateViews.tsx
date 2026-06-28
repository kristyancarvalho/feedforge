import type { ReactNode } from "react";

export const Loading = ({ label = "Loading" }: { label?: string }) => (
  <div className="state-view">
    <span className="spinner" />
    <span>{label}…</span>
  </div>
);

export const ErrorView = ({
  message,
  onRetry
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <div className="state-view state-view--error">
    <span>{message}</span>
    {onRetry ? (
      <button type="button" className="btn btn--ghost" onClick={onRetry}>
        Retry
      </button>
    ) : null}
  </div>
);

export const EmptyState = ({
  message,
  action
}: {
  message: string;
  action?: ReactNode;
}) => (
  <div className="state-view state-view--empty">
    <span>{message}</span>
    {action}
  </div>
);
