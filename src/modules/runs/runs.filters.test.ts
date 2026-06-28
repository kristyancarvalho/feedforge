import { describe, expect, it } from "vitest";
import { buildRunWhere } from "./runs.service";

describe("buildRunWhere", () => {
  it("returns an empty where for an empty query", () => {
    expect(buildRunWhere({})).toEqual({});
  });

  it("filters by trigger and status", () => {
    const where = buildRunWhere({ trigger: "manual", status: "success" });
    expect(where.trigger).toBe("manual");
    expect(where.status).toBe("success");
  });

  it("ignores blank trigger and status", () => {
    const where = buildRunWhere({ trigger: "   ", status: "" });
    expect(where.trigger).toBeUndefined();
    expect(where.status).toBeUndefined();
  });

  it("builds a startedAt range from valid dates", () => {
    const where = buildRunWhere({
      startedFrom: "2024-01-01T00:00:00.000Z",
      startedTo: "2024-01-31T00:00:00.000Z"
    });
    expect(where.startedAt).toBeDefined();
    const range = where.startedAt as { gte?: Date; lte?: Date };
    expect(range.gte?.toISOString()).toBe("2024-01-01T00:00:00.000Z");
    expect(range.lte?.toISOString()).toBe("2024-01-31T00:00:00.000Z");
  });

  it("supports an open-ended lower bound", () => {
    const where = buildRunWhere({ startedFrom: "2024-01-01T00:00:00.000Z" });
    const range = where.startedAt as { gte?: Date; lte?: Date };
    expect(range.gte).toBeInstanceOf(Date);
    expect(range.lte).toBeUndefined();
  });

  it("ignores invalid dates", () => {
    const where = buildRunWhere({ startedFrom: "nope", startedTo: "" });
    expect(where.startedAt).toBeUndefined();
  });
});
