import { useEffect, useState } from "react";
import { api } from "../api/client";
import { messageFromError } from "../hooks/useAsync";
import { SAVED_STATUSES, type NewsItem } from "../api/types";

interface Props {
  item: NewsItem;
  onChange: (next: NewsItem) => void;
  showNotes?: boolean;
}

export const EditorialControls = ({ item, onChange, showNotes = true }: Props) => {
  const [notes, setNotes] = useState(item.saved?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNotes(item.saved?.notes ?? "");
  }, [item.id, item.saved?.notes]);

  const guard = async (action: () => Promise<NewsItem>) => {
    setBusy(true);
    setError(null);
    try {
      onChange(await action());
    } catch (cause) {
      setError(messageFromError(cause));
    } finally {
      setBusy(false);
    }
  };

  const saved = item.saved !== null;

  return (
    <div className="editorial">
      <div className="editorial__row">
        {saved ? (
          <button
            type="button"
            className="btn btn--ghost"
            disabled={busy}
            onClick={() => guard(() => api.unsaveNews(item.id))}
          >
            Unsave
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--accent"
            disabled={busy}
            onClick={() => guard(() => api.saveNews(item.id))}
          >
            Save
          </button>
        )}

        <label className="editorial__status">
          <span>Editorial status</span>
          <select
            value={item.saved?.status ?? "saved"}
            disabled={busy}
            onChange={(event) =>
              guard(() => api.updateStatus(item.id, event.target.value))
            }
          >
            {SAVED_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      {showNotes ? (
        <div className="editorial__notes">
          <textarea
            value={notes}
            placeholder="Editorial notes"
            disabled={busy}
            onChange={(event) => setNotes(event.target.value)}
          />
          <button
            type="button"
            className="btn btn--ghost"
            disabled={busy}
            onClick={() =>
              guard(() =>
                api.updateStatus(item.id, item.saved?.status ?? "saved", notes)
              )
            }
          >
            Save notes
          </button>
        </div>
      ) : null}

      {error ? <p className="editorial__error">{error}</p> : null}
    </div>
  );
};
