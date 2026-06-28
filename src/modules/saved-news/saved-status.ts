export const SAVED_STATUSES = [
  "saved",
  "idea",
  "researching",
  "drafting",
  "published",
  "ignored"
] as const;

export type SavedStatus = (typeof SAVED_STATUSES)[number];

export const DEFAULT_SAVED_STATUS: SavedStatus = "saved";

export const isValidSavedStatus = (value: unknown): value is SavedStatus =>
  typeof value === "string" && SAVED_STATUSES.includes(value as SavedStatus);
