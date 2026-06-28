export interface ResolvedDate {
  date: Date;
  inferred: boolean;
}

export const parseDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric) && numeric > 0) {
    const fromEpoch = new Date(numeric > 1e12 ? numeric : numeric * 1000);
    if (!Number.isNaN(fromEpoch.getTime())) {
      return fromEpoch;
    }
  }

  return null;
};

export const resolvePublishedAt = (
  value: string | Date | null | undefined,
  now: Date = new Date()
): ResolvedDate => {
  const parsed = parseDate(value);
  if (parsed) {
    return { date: parsed, inferred: false };
  }
  return { date: now, inferred: true };
};

export const daysBetween = (from: Date, to: Date): number => {
  const diff = to.getTime() - from.getTime();
  return diff / (1000 * 60 * 60 * 24);
};
