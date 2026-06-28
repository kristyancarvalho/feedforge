import { describe, expect, it } from "vitest";
import { sourceHealthLevel } from "./sourceHealth";

const base = { successCount: 0, failureCount: 0, enabled: true };

describe("sourceHealthLevel", () => {
  it("returns failing when the last status is failing", () => {
    expect(sourceHealthLevel({ ...base, lastStatus: "failing", failureCount: 3 })).toBe("failing");
  });

  it("prioritises a failing last status over zero failures", () => {
    expect(sourceHealthLevel({ ...base, lastStatus: "failing" })).toBe("failing");
  });

  it("returns healthy when the last status is healthy with no failures", () => {
    expect(sourceHealthLevel({ ...base, lastStatus: "healthy", successCount: 10 })).toBe("healthy");
  });

  it("returns degraded when healthy but some failures were recorded", () => {
    expect(sourceHealthLevel({ ...base, lastStatus: "healthy", successCount: 8, failureCount: 2 })).toBe(
      "degraded"
    );
  });

  it("returns unknown for any other last status", () => {
    expect(sourceHealthLevel({ ...base, lastStatus: "pending" })).toBe("unknown");
    expect(sourceHealthLevel({ ...base, lastStatus: "" })).toBe("unknown");
  });
});
