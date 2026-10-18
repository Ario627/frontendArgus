import { describe, expect, it } from "vitest";
import {
  EMPTY_CELL,
  formatDateOnly,
  formatDuration,
  formatKgValue,
  parseKg
} from "@/shared/lib/format";

describe("parseKg", () => {
  it("menerima koma, titik, dan spasi", () => {
    expect(parseKg("12,4")).toBe(12.4);
    expect(parseKg("12.4")).toBe(12.4);
    expect(parseKg(" 8 ")).toBe(8);
  });

  it("menerima dua desimal", () => {
    expect(parseKg("12,45")).toBe(12.45);
  });

  it("menolak format tidak valid", () => {
    expect(parseKg("abc")).toBeNull();
    expect(parseKg("")).toBeNull();
    expect(parseKg("12,4,5")).toBeNull();
    expect(parseKg("12,456")).toBeNull();
    expect(parseKg("-3")).toBeNull();
    expect(parseKg("1e3")).toBeNull();
  });

  it("tidak mengubah nilai batas", () => {
    expect(parseKg("500")).toBe(500);
    expect(parseKg("500,5")).toBe(500.5);
    expect(parseKg("0,1")).toBe(0.1);
  });
});

describe("formatKgValue", () => {
  it("manual satu desimal, device dua desimal", () => {
    expect(formatKgValue(12.4, "manual")).toBe("12,4");
    expect(formatKgValue(12.4, "device")).toBe("12,40");
  });

  it("nilai tidak terhingga menjadi tanda kosong", () => {
    expect(formatKgValue(Number.NaN)).toBe(EMPTY_CELL);
    expect(formatKgValue(Number.POSITIVE_INFINITY)).toBe(EMPTY_CELL);
  });
});

describe("formatDuration", () => {
  it("di bawah satu menit", () => {
    expect(formatDuration(30_000)).toBe("baru saja");
  });

  it("jam dan menit dengan menit dua digit", () => {
    expect(formatDuration(14 * 3_600_000 + 20 * 60_000)).toBe("14j 20m");
    expect(formatDuration(3 * 3_600_000 + 5 * 60_000)).toBe("3j 05m");
  });

  it("menit saja tanpa jam", () => {
    expect(formatDuration(45 * 60_000)).toBe("45m");
  });

  it("nilai negatif menjadi tanda kosong", () => {
    expect(formatDuration(-1)).toBe(EMPTY_CELL);
  });
});

describe("formatDateOnly", () => {
  it("mempertahankan tanggal tanpa bergeser zona waktu", () => {
    const formatted = formatDateOnly("2026-10-16");
    expect(formatted).toContain("16");
    expect(formatted).toContain("2026");
  });

  it("menolak bentuk yang tidak dikenal", () => {
    expect(formatDateOnly("16-10-2026")).toBe(EMPTY_CELL);
    expect(formatDateOnly("2026-10-16T00:00:00.000Z")).toBe(EMPTY_CELL);
  });
});