import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SAVED_STATUSES, SORT_OPTIONS } from "../api/types";
import { useI18n } from "../i18n/I18nProvider";
import { FilterIcon } from "./icons";
import { HelpTooltip } from "./HelpTooltip";

export type FilterField =
  | "q"
  | "source"
  | "sourceType"
  | "topic"
  | "keyword"
  | "language"
  | "matchStrength"
  | "minScore"
  | "maxScore"
  | "sort"
  | "savedState"
  | "savedStatus"
  | "publishedFrom"
  | "publishedTo"
  | "runId"
  | "hasSummary"
  | "hasReasons"
  | "hasNegativePenalty";

const FIELD_TO_PARAM: Record<FilterField, string> = {
  q: "q",
  source: "source",
  sourceType: "sourceType",
  topic: "topic",
  keyword: "keyword",
  language: "language",
  matchStrength: "matchStrength",
  minScore: "minScore",
  maxScore: "maxScore",
  sort: "sort",
  savedState: "saved",
  savedStatus: "status",
  publishedFrom: "publishedFrom",
  publishedTo: "publishedTo",
  runId: "runId",
  hasSummary: "hasSummary",
  hasReasons: "hasReasons",
  hasNegativePenalty: "hasNegativePenalty"
};

type Props = {
  fields: FilterField[];
  locked?: Record<string, string>;
};

export function FilterBar({ fields, locked = {} }: Props) {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  const initial = useMemo(() => {
    const draft: Record<string, string> = {};
    for (const field of fields) {
      const param = FIELD_TO_PARAM[field];
      draft[param] = searchParams.get(param) ?? "";
    }
    return draft;
  }, [fields, searchParams]);

  const [draft, setDraft] = useState<Record<string, string>>(initial);

  useEffect(() => {
    setDraft(initial);
  }, [initial]);

  const activeCount = fields.reduce((count, field) => {
    const param = FIELD_TO_PARAM[field];
    const value = searchParams.get(param);
    return value && value !== "" ? count + 1 : count;
  }, 0);

  function setField(param: string, value: string) {
    setDraft((prev) => ({ ...prev, [param]: value }));
  }

  function apply(event: React.FormEvent) {
    event.preventDefault();
    const next = new URLSearchParams();
    for (const [param, value] of Object.entries(locked)) {
      next.set(param, value);
    }
    for (const field of fields) {
      const param = FIELD_TO_PARAM[field];
      const value = draft[param]?.trim();
      if (value) next.set(param, value);
    }
    setSearchParams(next, { replace: true });
  }

  function reset() {
    const next = new URLSearchParams();
    for (const [param, value] of Object.entries(locked)) {
      next.set(param, value);
    }
    setSearchParams(next, { replace: true });
  }

  return (
    <form className="filter-bar" onSubmit={apply}>
      <div className="filter-bar-head">
        <span className="filter-bar-title">
          <FilterIcon className="inline-icon" />
          {t("filters.title")}
          {activeCount > 0 ? (
            <span className="filter-active-count">
              {activeCount} {t("common.filtersActive")}
            </span>
          ) : null}
        </span>
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
        {fields.map((field) => (
          <Field key={field} field={field} value={draft[FIELD_TO_PARAM[field]] ?? ""} onChange={setField} />
        ))}
      </div>
    </form>
  );
}

function Field({
  field,
  value,
  onChange
}: {
  field: FilterField;
  value: string;
  onChange: (param: string, value: string) => void;
}) {
  const { t } = useI18n();
  const param = FIELD_TO_PARAM[field];
  const label = t(`filters.${field}`);

  const set = (next: string) => onChange(param, next);

  if (field === "sourceType") {
    return (
      <Wrapper label={label}>
        <select className="select" value={value} onChange={(e) => set(e.target.value)}>
          <option value="">{t("common.all")}</option>
          <option value="rss">{t("filters.typeRss")}</option>
          <option value="html">{t("filters.typeHtml")}</option>
        </select>
      </Wrapper>
    );
  }

  if (field === "language") {
    return (
      <Wrapper label={label}>
        <select className="select" value={value} onChange={(e) => set(e.target.value)}>
          <option value="">{t("common.all")}</option>
          <option value="en">English</option>
          <option value="pt-BR">Português</option>
        </select>
      </Wrapper>
    );
  }

  if (field === "matchStrength") {
    return (
      <Wrapper label={label}>
        <select className="select" value={value} onChange={(e) => set(e.target.value)}>
          <option value="">{t("common.all")}</option>
          <option value="strong">{t("matchStrength.strong")}</option>
          <option value="good">{t("matchStrength.good")}</option>
          <option value="weak">{t("matchStrength.weak")}</option>
          <option value="low">{t("matchStrength.low")}</option>
        </select>
      </Wrapper>
    );
  }

  if (field === "sort") {
    return (
      <Wrapper label={label}>
        <select className="select" value={value} onChange={(e) => set(e.target.value)}>
          {SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {t(`sort.${option}`)}
            </option>
          ))}
        </select>
      </Wrapper>
    );
  }

  if (field === "savedState") {
    return (
      <Wrapper label={label}>
        <select className="select" value={value} onChange={(e) => set(e.target.value)}>
          <option value="">{t("common.all")}</option>
          <option value="true">{t("filters.savedOnly")}</option>
          <option value="false">{t("filters.notSaved")}</option>
        </select>
      </Wrapper>
    );
  }

  if (field === "savedStatus") {
    return (
      <Wrapper label={label}>
        <select className="select" value={value} onChange={(e) => set(e.target.value)}>
          <option value="">{t("common.all")}</option>
          {SAVED_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`savedStatus.${status}`)}
            </option>
          ))}
        </select>
      </Wrapper>
    );
  }

  if (field === "hasSummary" || field === "hasReasons" || field === "hasNegativePenalty") {
    return (
      <Wrapper label={label}>
        <select className="select" value={value} onChange={(e) => set(e.target.value)}>
          <option value="">{t("common.all")}</option>
          <option value="true">{t("common.yes")}</option>
          <option value="false">{t("common.no")}</option>
        </select>
      </Wrapper>
    );
  }

  if (field === "minScore" || field === "maxScore") {
    return (
      <Wrapper label={label}>
        <input
          className="input"
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => set(e.target.value)}
        />
      </Wrapper>
    );
  }

  if (field === "publishedFrom" || field === "publishedTo") {
    return (
      <Wrapper label={label}>
        <input className="input" type="date" value={value} onChange={(e) => set(e.target.value)} />
      </Wrapper>
    );
  }

  return (
    <Wrapper label={label}>
      <input className="input" type="text" value={value} onChange={(e) => set(e.target.value)} />
    </Wrapper>
  );
}

function Wrapper({ label, children, help }: { label: string; children: React.ReactNode; help?: string }) {
  return (
    <label className="filter-field">
      <span className="filter-label">
        {label}
        {help ? <HelpTooltip label={label} text={help} /> : null}
      </span>
      {children}
    </label>
  );
}
