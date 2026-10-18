import { describe, expect, it } from "vitest";
import {
  buildFractionsFromForm,
  fractionsFromQuick,
  parsePercent
} from "@/shared/lib/fraction-input";

describe("parsePercent", () => {
  it("menerima koma dan desimal", () => {
    expect(parsePercent("12,5")).toBe(12.5);
    expect(parsePercent("12.5")).toBe(12.5);
    expect(parsePercent("100")).toBe(100);
  });

  it("menolak di atas 100 dan format rusak", () => {
    expect(parsePercent("100,5")).toBeNull();
    expect(parsePercent("abc")).toBeNull();
    expect(parsePercent("")).toBeNull();
  });
});

describe("fractionsFromQuick", () => {
  it("dominan memberi 60 persen", () => {
    expect(fractionsFromQuick({ dominant: "A", extras: [] })).toEqual({ A: 60 });
  });

  it("dua tambahan masing-masing 15 persen", () => {
    expect(fractionsFromQuick({ dominant: "A", extras: ["B", "C"] })).toEqual({
      A: 60,
      B: 15,
      C: 15
    });
  });

  it("lima pilihan penuh tidak pernah melebihi 100", () => {
    const result = fractionsFromQuick({ dominant: "A", extras: ["B", "C", "D", "E"] });
    const total = Object.values(result).reduce((sum, value) => sum + (value ?? 0), 0);
    expect(total).toBe(100);
    expect(result.E).toBe(10);
  });

  it("tambahan yang sama dengan dominan diabaikan", () => {
    expect(fractionsFromQuick({ dominant: "B", extras: ["B"] })).toEqual({ B: 60 });
  });

  it("kode dominan tidak dikenal menghasilkan objek kosong", () => {
    expect(fractionsFromQuick({ dominant: "Z", extras: [] })).toEqual({});
  });
});

describe("buildFractionsFromForm", () => {
  it("mode cepat memakai dominan dan tambahan", () => {
    const result = buildFractionsFromForm({
      rinciEnabled: false,
      rinci: {},
      dominant: "A",
      extras: ["B"]
    });
    expect(result).toEqual({ ok: true, fractions: { A: 60, B: 15 } });
  });

  it("mode cepat tanpa dominan meminta pilihan", () => {
    const result = buildFractionsFromForm({
      rinciEnabled: false,
      rinci: {},
      dominant: "",
      extras: []
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("NEED_DOMINANT");
  });

  it("mode rinci menghormati nilai yang diisi", () => {
    const result = buildFractionsFromForm({
      rinciEnabled: true,
      rinci: { A: "30", B: "40" },
      dominant: "",
      extras: []
    });
    expect(result).toEqual({ ok: true, fractions: { A: 30, B: 40 } });
  });

  it("mode rinci menolak nilai tidak valid", () => {
    const result = buildFractionsFromForm({
      rinciEnabled: true,
      rinci: { A: "abc" },
      dominant: "",
      extras: []
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("RINCI_INVALID");
      expect(result.field).toBe("A");
    }
  });

  it("mode rinci menolak total di atas 100", () => {
    const result = buildFractionsFromForm({
      rinciEnabled: true,
      rinci: { A: "60", B: "45" },
      dominant: "",
      extras: []
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("RINCI_OVER");
  });

  it("mode rinci kosong dan nol ditolak", () => {
    const empty = buildFractionsFromForm({
      rinciEnabled: true,
      rinci: {},
      dominant: "",
      extras: []
    });
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.reason).toBe("RINCI_EMPTY");

    const zero = buildFractionsFromForm({
      rinciEnabled: true,
      rinci: { A: "0" },
      dominant: "",
      extras: []
    });
    expect(zero.ok).toBe(false);
    if (!zero.ok) expect(zero.reason).toBe("RINCI_EMPTY");
  });
});