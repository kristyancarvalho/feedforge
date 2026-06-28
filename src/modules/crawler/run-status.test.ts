import { describe, expect, it } from "vitest";
import { calculateRunStatus } from "./run-status";

describe("run status calculation", () => {
  it("returns success when every source succeeds", () => {
    expect(calculateRunStatus(3, 3, 0)).toBe("success");
  });

  it("returns success when there are no sources", () => {
    expect(calculateRunStatus(0, 0, 0)).toBe("success");
  });

  it("returns failed when no source succeeds", () => {
    expect(calculateRunStatus(3, 0, 3)).toBe("failed");
  });

  it("returns partial_success when some sources fail", () => {
    expect(calculateRunStatus(3, 2, 1)).toBe("partial_success");
  });
});
