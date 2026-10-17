export interface LogEntry {
  readonly at: number;
  readonly level: "warn" | "error";
  readonly scope: string;
  readonly message: string;
}

const MAX_ENTRIES = 200;
const SENSITIVE_KEY_PARTS: ReadonlySet<string> = new Set([
  "token",
  "authorization",
  "auth",
  "secret",
  "password",
  "cookie",
  "hash",
  "ip",
  "kontak",
  "email",
  "telepon",
  "nik"
]);
const DEV = import.meta.env.DEV;

const entries: LogEntry[] = [];

function keyParts(key: string): readonly string[] {
  return key
    .split(/(?=[A-Z])|[^A-Za-z0-9]+/)
    .filter((part) => part.length > 0)
    .map((part) => part.toLowerCase());
}

function isSensitiveKey(key: string): boolean {
  return keyParts(key).some((part) => SENSITIVE_KEY_PARTS.has(part));
}

function scrubMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (isSensitiveKey(key)) continue;
    safe[key] = value;
  }
  return safe;
}

function record(level: LogEntry["level"], scope: string, message: string): void {
  entries.push({ at: Date.now(), level, scope, message });
  if (entries.length > MAX_ENTRIES) entries.splice(0, entries.length - MAX_ENTRIES);
}

export function logDev(scope: string, message: string, meta?: Record<string, unknown>): void {
  record("warn", scope, message);
  if (!DEV) return;
  if (meta) console.warn(`[${scope}] ${message}`, scrubMeta(meta));
  else console.warn(`[${scope}] ${message}`);
}

export function logError(scope: string, message: string, meta?: Record<string, unknown>): void {
  record("error", scope, message);
  if (!DEV) return;
  if (meta) console.error(`[${scope}] ${message}`, scrubMeta(meta));
  else console.error(`[${scope}] ${message}`);
}

export function getRecentLogs(): readonly LogEntry[] {
  return entries;
}