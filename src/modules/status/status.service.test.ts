import { describe, expect, it } from "vitest";
import { resolveOperationalStatus } from "./status.service";

describe("resolveOperationalStatus", () => {
  it("reports running when a pipeline is active", () => {
    expect(resolveOperationalStatus(true, "success", 0, 4)).toBe("running");
    expect(resolveOperationalStatus(true, null, 3, 0)).toBe("running");
  });

  it("reports unknown when there are no sources", () => {
    expect(resolveOperationalStatus(false, "success", 0, 0)).toBe("unknown");
  });

  it("reports unknown when no run has happened yet", () => {
    expect(resolveOperationalStatus(false, null, 0, 4)).toBe("unknown");
  });

  it("reports offline when the latest run failed", () => {
    expect(resolveOperationalStatus(false, "failed", 0, 4)).toBe("offline");
  });

  it("reports degraded on partial success", () => {
    expect(resolveOperationalStatus(false, "partial_success", 0, 4)).toBe("degraded");
  });

  it("reports degraded when sources are failing", () => {
    expect(resolveOperationalStatus(false, "success", 2, 4)).toBe("degraded");
  });

  it("reports operational when everything is healthy", () => {
    expect(resolveOperationalStatus(false, "success", 0, 4)).toBe("operational");
  });
});
