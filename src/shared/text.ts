export const stripAccents = (value: string): string =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const normalizeText = (value: string | null | undefined): string => {
  if (!value) {
    return "";
  }

  return stripAccents(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.+#-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const normalizeWhitespace = (value: string | null | undefined): string => {
  if (!value) {
    return "";
  }
  return value.replace(/\s+/g, " ").trim();
};

export const stripHtml = (value: string | null | undefined): string => {
  if (!value) {
    return "";
  }
  return normalizeWhitespace(value.replace(/<[^>]*>/g, " "));
};

export const truncate = (value: string, maxLength: number): string => {
  const clean = normalizeWhitespace(value);
  if (clean.length <= maxLength) {
    return clean;
  }
  return `${clean.slice(0, Math.max(0, maxLength - 1)).trimEnd()}\u2026`;
};

export const titleSimilarity = (left: string, right: string): number => {
  const a = new Set(normalizeText(left).split(" ").filter(Boolean));
  const b = new Set(normalizeText(right).split(" ").filter(Boolean));

  if (a.size === 0 || b.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) {
      intersection += 1;
    }
  }

  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
};
