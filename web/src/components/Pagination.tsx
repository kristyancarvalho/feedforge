import { useI18n } from "../i18n/I18nProvider";

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onChange }: Props) {
  const { t } = useI18n();
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label={t("runs.title")}>
      <button
        type="button"
        className="button button-ghost"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>
      <span className="pagination-info">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        className="button button-ghost"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </nav>
  );
}
