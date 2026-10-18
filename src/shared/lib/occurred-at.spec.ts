import { describe, expect, it } from "vitest";
import {
  inferOccurredAtMode,
  isoToLocalInputValue,
  occurredAtIsoFor
} from "@/shared/lib/occurred-at";

describe("occurredAtIsoFor", () => {
  it("now menghasilkan waktu sekarang", () => {
    const delta = Math.abs(Date.now() - Date.parse(occurredAtIsoFor("now")));
    expect(delta).toBeLessThan(1_000);
  });

  it("min30 menghasilkan 30 menit lalu", () => {
    const delta = Date.now() - 30 * 60_000 - Date.parse(occurredAtIsoFor("min30"));
    expect(Math.abs(delta)).toBeLessThan(1_000);
  });

  it("hour1 menghasilkan satu jam lalu", () => {
    const delta = Date.now() - 3_600_000 - Date.parse(occurredAtIsoFor("hour1"));
    expect(Math.abs(delta)).toBeLessThan(1_000);
  });
});

describe("inferOccurredAtMode", () => {
  it("mengenali now di dalam toleransi", () => {
    expect(inferOccurredAtMode(new Date(Date.now() - 5_000).toISOString())).toBe("now");
  });

  it("mengenali mode min30 dan hour1 dari ISO hasil sendiri", () => {
    expect(inferOccurredAtMode(occurredAtIsoFor("min30"))).toBe("min30");
    expect(inferOccurredAtMode(occurredAtIsoFor("hour1"))).toBe("hour1");
  });

  it("waktu jauh di belakang menjadi custom", () => {
    expect(inferOccurredAtMode(new Date(Date.now() - 5 * 3_600_000).toISOString())).toBe("custom");
  });

  it("ISO tidak valid menjadi custom", () => {
    expect(inferOccurredAtMode("bukan-waktu")).toBe("custom");
  });
});

describe("isoToLocalInputValue", () => {
  it("memformat nilai untuk input datetime-local", () => {
    expect(isoToLocalInputValue("2026-10-18T09:30:00.000Z")).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
    );
  });

  it("ISO tidak valid menjadi string kosong", () => {
    expect(isoToLocalInputValue("x")).toBe("");
  });
});