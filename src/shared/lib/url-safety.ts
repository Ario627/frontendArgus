const MAX_URL_LENGTH = 2048;
const ALLOWED_PROTOCOLS: ReadonlySet<string> = new Set(["http:", "https:"]);

export function parseSafeUrl(raw: unknown, base?: string): URL | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_URL_LENGTH) return null;
  let url: URL;
  try {
    url = new URL(trimmed, base);
  } catch {
    return null;
  }
  if (!ALLOWED_PROTOCOLS.has(url.protocol)) return null;
  if (url.username !== "" || url.password !== "") return null;
  return url;
}

export function isSafeExternalHref(raw: unknown): boolean {
  return parseSafeUrl(raw) !== null;
}

export function isSafeAssetUrl(raw: unknown, allowedOrigins: readonly string[], base?: string): boolean {
  const url = parseSafeUrl(raw, base);
  return url !== null && allowedOrigins.includes(url.origin);
}

export function buildMediaOrigins(
  apiOrigin: string,
  configuredOrigins: readonly string[],
  sameOrigin?: string
): readonly string[] {
  const origins = new Set<string>(configuredOrigins);
  origins.add(apiOrigin);
  if (sameOrigin !== undefined && sameOrigin !== "") origins.add(sameOrigin);
  return Object.freeze([...origins]);
}