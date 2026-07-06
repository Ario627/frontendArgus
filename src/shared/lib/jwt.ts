import type { AuthenticatedUser, UserRole } from "../types/common.types";

interface JwtPayload {
  readonly sub: string;
  readonly username: string;
  readonly role: UserRole;
  readonly fleetId: string | null;
  readonly exp?: number;
  readonly iat?: number;
}

export function decodeJwt(token: string): JwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  const payloadB64Url = parts[1]!;
  const payloadB64 = payloadB64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = payloadB64.padEnd(
    payloadB64.length + ((4 - (payloadB64.length % 4)) % 4),
    "=",
  );
  const decoded = atob(padded);
  const utf8 = decodeURIComponent(
    Array.from(decoded)
      .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join(""),
  );
  return JSON.parse(utf8) as JwtPayload;
}

export function tokenToUser(token: string): AuthenticatedUser {
  const payload = decodeJwt(token);
  return {
    id: payload.sub,
    username: payload.username,
    role: payload.role,
    fleetId: payload.fleetId,
  };
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const payload = decodeJwt(token);
    if (typeof payload.exp !== "number") return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}
