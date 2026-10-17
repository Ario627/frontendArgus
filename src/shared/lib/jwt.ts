const TOKEN_EXPIRY_SKEW_MS = 30_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodeBase64UrlSegment(segment: string): string | null {
  try {
    const base64 = segment.replace(/[-_]/g, (char) => (char === "-" ? "+" : "/"));
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function decodeJwtClaims(token: string): Record<string, unknown> | null {
  const segments = token.split(".");
  if (segments.length !== 3) return null;
  const payload = segments[1];
  if (payload === undefined || payload.length === 0) return null;
  const json = decodeBase64UrlSegment(payload);
  if (json === null) return null;
  try {
    const parsed: unknown = JSON.parse(json);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function getTokenExpiresAtMs(token: string): number | null {
  const claims = decodeJwtClaims(token);
  const exp = claims?.["exp"];
  return typeof exp === "number" && Number.isFinite(exp) ? exp * 1000 : null;
}

export function isTokenExpired(token: string, skewMs: number = TOKEN_EXPIRY_SKEW_MS): boolean {
  const expiresAtMs = getTokenExpiresAtMs(token);
  if (expiresAtMs === null) return false;
  return expiresAtMs <= Date.now() + skewMs;
}