import { normalizeText } from "../../shared/text";
import type { VectorizedItem } from "./text-vectorizer";

export type MatchField = "title" | "summary" | "content" | "tags";

export interface TermMatch {
  term: string;
  field: MatchField;
}

const FIELD_PRIORITY: MatchField[] = ["title", "tags", "summary", "content"];

const phraseInText = (phrase: string, text: string): boolean => {
  if (!phrase || !text) {
    return false;
  }
  return ` ${text} `.includes(` ${phrase} `);
};

const phraseInTags = (phrase: string, tags: string[]): boolean =>
  tags.some((tag) => tag === phrase || phraseInText(phrase, tag));

export const matchTerm = (term: string, vector: VectorizedItem): MatchField | null => {
  const normalized = normalizeText(term);
  if (!normalized) {
    return null;
  }

  for (const field of FIELD_PRIORITY) {
    if (field === "tags") {
      if (phraseInTags(normalized, vector.tags)) {
        return "tags";
      }
      continue;
    }
    if (phraseInText(normalized, vector[field])) {
      return field;
    }
  }

  return null;
};

export const matchTerms = (terms: string[], vector: VectorizedItem): TermMatch[] => {
  const matches: TermMatch[] = [];
  const seen = new Set<string>();

  for (const term of terms) {
    const key = normalizeText(term);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);

    const field = matchTerm(term, vector);
    if (field) {
      matches.push({ term, field });
    }
  }

  return matches;
};
