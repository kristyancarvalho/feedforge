import { describe, expect, it } from "vitest";
import { formatDate, formatDay, formatDuration, hostnameOf } from "./format";

describe("formatDate / formatDay", () => {
  it("returns the fallback for null input", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDay(null)).toBe("—");
  });

  it("returns a custom fallback when provided", () => {
    expect(formatDate(null, "never")).toBe("never");
    expect(formatDay(null, "never")).toBe("never");
  });

  it("returns the fallback for unparseable dates", () => {
    expect(formatDate("not-a-date")).toBe("—");
    expect(formatDay("not-a-date")).toBe("—");
  });

  it("formats valid dates into a non-fallback string", () => {
    expect(formatDate("2024-01-15T10:30:00.000Z")).not.toBe("—");
    expect(formatDay("2024-01-15T10:30:00.000Z")).not.toBe("—");
  });
});

describe("formatDuration", () => {
  it("returns the fallback for null or negative input", () => {
    expect(formatDuration(null)).toBe("—");
    expect(formatDuration(-5)).toBe("—");
  });

  it("renders sub-second durations in milliseconds", () => {
    expect(formatDuration(0)).toBe("0ms");
    expect(formatDuration(999)).toBe("999ms");
  });

  it("renders sub-minute durations in seconds", () => {
    expect(formatDuration(1000)).toBe("1s");
    expect(formatDuration(1500)).toBe("1.5s");
  });

  it("renders longer durations in minutes and seconds", () => {
    expect(formatDuration(60000)).toBe("1m 0s");
    expect(formatDuration(90000)).toBe("1m 30s");
  });
});

describe("hostnameOf", () => {
  it("extracts the hostname and strips the www prefix", () => {
    expect(hostnameOf("https://www.example.com/path")).toBe("example.com");
    expect(hostnameOf("https://blog.github.com/post")).toBe("blog.github.com");
  });

  it("returns the raw value for unparseable urls", () => {
    expect(hostnameOf("not a url")).toBe("not a url");
  });
});
