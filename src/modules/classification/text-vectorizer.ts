import { normalizeText } from "../../shared/text";

export interface ClassifiableItem {
  title: string;
  summary: string | null;
  contentText: string | null;
  tags: string[];
}

export interface VectorizedItem {
  title: string;
  summary: string;
  content: string;
  tags: string[];
}

export const vectorize = (item: ClassifiableItem): VectorizedItem => ({
  title: normalizeText(item.title),
  summary: normalizeText(item.summary),
  content: normalizeText(item.contentText),
  tags: item.tags.map((tag) => normalizeText(tag)).filter(Boolean)
});
