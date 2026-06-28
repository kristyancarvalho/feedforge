import { describe, expect, it } from "vitest";
import { ApiError, buildQuery } from "./client";

describe("buildQuery", () => {
  it("returns an empty string when there are no values", () => {
    expect(buildQuery({})).toBe("");
    expect(buildQuery({ q: undefined })).toBe("");
  });

  it("drops undefined and empty values", () => {
    expect(buildQuery({ q: "go", source: undefined, topic: "" })).toBe("?q=go");
  });

  it("encodes multiple params with a leading question mark", () => {
    const query = buildQuery({ q: "linux kernel", sort: "score_desc" });
    expect(query.startsWith("?")).toBe(true);
    const params = new URLSearchParams(query);
    expect(params.get("q")).toBe("linux kernel");
    expect(params.get("sort")).toBe("score_desc");
  });
});

describe("ApiError", () => {
  it("captures code, message, status and details", () => {
    const error = new ApiError("NOT_FOUND", "Missing", 404, { id: "x" });
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ApiError");
    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe("Missing");
    expect(error.status).toBe(404);
    expect(error.details).toEqual({ id: "x" });
  });
});
