import { describe, expect, it } from "vitest";
import { decodeJwtClaims, getTokenExpiresAtMs, isTokenExpired } from "@/shared/lib/jwt";

function base64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function makeToken(payload: Record<string, unknown>): string {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64Url(JSON.stringify(payload));
  return `${header}.${body}.tanda-tangan`;
}

describe("decodeJwtClaims", () => {
  it("membaca klaim dari token berformat benar", () => {
    const claims = decodeJwtClaims(makeToken({ sub: "u-1", role: "admin", exp: 2_000_000_000 }));
    expect(claims?.["sub"]).toBe("u-1");
    expect(claims?.["role"]).toBe("admin");
  });

  it("mengembalikan null untuk bentuk rusak", () => {
    expect(decodeJwtClaims("bukan.token")).toBeNull();
    expect(decodeJwtClaims("a.b.c")).toBeNull();
    expect(decodeJwtClaims("")).toBeNull();
  });
});

describe("getTokenExpiresAtMs", () => {
  it("mengubah detik menjadi milidetik", () => {
    expect(getTokenExpiresAtMs(makeToken({ exp: 1_800_000_000 }))).toBe(1_800_000_000_000);
  });

  it("null saat klaim exp tidak ada", () => {
    expect(getTokenExpiresAtMs(makeToken({ sub: "u-1" }))).toBeNull();
  });
});

describe("isTokenExpired", () => {
  it("token kedaluwarsa terdeteksi", () => {
    const pastExpSeconds = Math.floor((Date.now() - 3_600_000) / 1000);
    expect(isTokenExpired(makeToken({ exp: pastExpSeconds }))).toBe(true);
  });

  it("token masih berlaku", () => {
    const futureExpSeconds = Math.floor((Date.now() + 3_600_000) / 1000);
    expect(isTokenExpired(makeToken({ exp: futureExpSeconds }))).toBe(false);
  });

  it("tanpa klaim exp dianggap tidak kedaluwarsa", () => {
    expect(isTokenExpired(makeToken({ sub: "u-1" }))).toBe(false);
  });
});