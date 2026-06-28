import { useState } from "react";
import { api } from "../api/client";
import { SAVED_STATUSES } from "../api/types";
import type { NewsItem } from "../api/types";
import { useI18n } from "../i18n/I18nProvider";
import { messageFromError } from "../hooks/useAsync";
import { SavedIcon, NotesIcon } from "./icons";

type Props = {
  item: NewsItem;
  onChange: (next: NewsItem) => void;
};

export function EditorialControls({ item, onChange }: Props) {
  const { t } = useI18n();
  const [notes, setNotes] = useState(item.saved?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saved = item.saved;

  async function run(action: () => Promise<NewsItem>) {
    setBusy(true);
    setError(null);
    try {
      const next = await action();
      onChange(next);
      setNotes(next.saved?.notes ?? "");
    } catch (cause) {
      setError(messageFromError(cause));
    } finally {
      setBusy(false);
    }
  }

  if (!saved) {
    return (
      <div className="editorial-controls">
        {error ? <p className="error-text" role="alert">{error}</p> : null}
        <button
          type="button"
          className="button button-primary"
          disabled={busy}
          onClick={() => run(() => api.saveNews(item.id))}
        >
          <SavedIcon className="inline-icon" />
          {t("actions.save")}
        </button>
      </div>
    );
  }

  return (
    <div className="editorial-controls">
      {error ? <p className="error-text" role="alert">{error}</p> : null}
      <label className="field-row">
        <span className="filter-label">{t("savedStatus.label")}</span>
        <select
          className="select"
          value={saved.status}
          disabled={busy}
          onChange={(event) => run(() => api.updateStatus(item.id, event.target.value))}
        >
          {SAVED_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`savedStatus.${status}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="field-row">
        <span className="filter-label">
          <NotesIcon className="inline-icon" />
          {t("detail.notes")}
        </span>
        <textarea
          className="input"
          rows={3}
          value={notes}
          disabled={busy}
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>
      <div className="field-row-actions">
        <button
          type="button"
          className="button button-primary"
          disabled={busy}
          onClick={() => run(() => api.updateStatus(item.id, saved.status, notes))}
        >
          {t("actions.saveNotes")}
        </button>
        <button
          type="button"
          className="button button-ghost"
          disabled={busy || notes === ""}
          onClick={() => {
            setNotes("");
            void run(() => api.updateStatus(item.id, saved.status, ""));
          }}
        >
          {t("actions.clearNotes")}
        </button>
        <button
          type="button"
          className="button button-danger"
          disabled={busy}
          onClick={() => run(() => api.unsaveNews(item.id))}
        >
          {t("actions.unsave")}
        </button>
      </div>
    </div>
  );
}
