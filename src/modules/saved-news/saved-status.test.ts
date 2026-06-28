import { describe, expect, it } from "vitest";
import { DEFAULT_SAVED_STATUS, SAVED_STATUSES, isValidSavedStatus } from "./saved-status";

describe("saved status validation", () => {
  it("accepts every allowed status", () => {
    for (const status of SAVED_STATUSES) {
      expect(isValidSavedStatus(status)).toBe(true);
    }
  });

  it("rejects unknown or malformed statuses", () => {
    expect(isValidSavedStatus("archived")).toBe(false);
    expect(isValidSavedStatus("")).toBe(false);
    expect(isValidSavedStatus(null)).toBe(false);
    expect(isValidSavedStatus(42)).toBe(false);
  });

  it("defaults to saved", () => {
    expect(DEFAULT_SAVED_STATUS).toBe("saved");
    expect(isValidSavedStatus(DEFAULT_SAVED_STATUS)).toBe(true);
  });
});
