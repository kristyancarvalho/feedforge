import { describe, expect, it } from "vitest";
import { scoreBarWidth } from "./scoreBar";

describe("scoreBarWidth", () => {
  it("returns an empty bar for a zero score", () => {
    expect(scoreBarWidth(0)).toBe(0);
  });

  it("returns a half bar for a mid score", () => {
    expect(scoreBarWidth(50)).toBe(50);
  });

  it("returns a full bar for a maximum score", () => {
    expect(scoreBarWidth(100)).toBe(100);
  });

  it("rounds fractional scores", () => {
    expect(scoreBarWidth(49.4)).toBe(49);
    expect(scoreBarWidth(49.6)).toBe(50);
  });

  it("clamps values outside the 0 to 100 range", () => {
    expect(scoreBarWidth(-20)).toBe(0);
    expect(scoreBarWidth(160)).toBe(100);
  });

  it("falls back to zero for non-finite values", () => {
    expect(scoreBarWidth(Number.NaN)).toBe(0);
    expect(scoreBarWidth(Number.POSITIVE_INFINITY)).toBe(0);
  });
});
