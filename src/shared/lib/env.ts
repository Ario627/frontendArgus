import { z } from "zod";
import { buildMediaOrigins, parseSafeUrl } from "@/shared/lib/url-safety";

export interface AppEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_POLL_OPERATIONAL_MS: number;
  readonly VITE_POLL_FLEET_MS: number;
  readonly VITE_OUTBOX_SYNC_MS: number;
  readonly VITE_SYNC_BATCH_MAX: number;
  readonly VITE_PHOTO_MAX_BYTES: number;
  readonly VITE_DEMO_MODE: boolean;
  readonly VITE_MEDIA_ORIGINS: readonly string[];
  readonly apiOrigin: string;
  readonly mediaOrigins: readonly string[];
  readonly isProduction: boolean;
}

export class EnvConfigError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Konfigurasi lingkungan tidak valid. ${issues.join(" ")}`);
    this.name = "EnvConfigError";
    this.issues = issues;
  }
}

interface EnvBuildOk {
  readonly ok: true;
  readonly value: AppEnv;
}

interface EnvBuildFail {
  readonly ok: false;
  readonly issues: readonly string[];
}

type EnvBuild = EnvBuildOk | EnvBuildFail;

function envInteger(name: string, min: number, max: number, fallback: number) {
  return z.coerce
    .number({ error: `${name} harus berupa angka.` })
    .int({ error: `${name} harus bilangan bulat.` })
    .min(min, { error: `${name} minimal ${min}.` })
    .max(max, { error: `${name} maksimal ${max}.` })
    .default(fallback);
}

const envSourceSchema = z.object({
  VITE_API_URL: z.url({
    protocol: /^https?$/,
    error: "VITE_API_URL wajib alamat http/https yang valid."
  }),
  VITE_APP_TITLE: z
    .string()
    .trim()
    .min(1, { error: "VITE_APP_TITLE tidak boleh kosong." })
    .default("ARGUS"),
  VITE_POLL_OPERATIONAL_MS: envInteger("VITE_POLL_OPERATIONAL_MS", 15_000, 600_000, 60_000),
  VITE_POLL_FLEET_MS: envInteger("VITE_POLL_FLEET_MS", 10_000, 600_000, 30_000),
  VITE_OUTBOX_SYNC_MS: envInteger("VITE_OUTBOX_SYNC_MS", 15_000, 600_000, 60_000),
  VITE_SYNC_BATCH_MAX: envInteger("VITE_SYNC_BATCH_MAX", 1, 50, 50),
  VITE_PHOTO_MAX_BYTES: envInteger("VITE_PHOTO_MAX_BYTES", 102_400, 4_194_304, 1_048_576),
  VITE_DEMO_MODE: z.stringbool({ error: "VITE_DEMO_MODE harus true atau false." }).default(false),
  VITE_MEDIA_ORIGINS: z.string().default("")
});

type ParsedSource = z.infer<typeof envSourceSchema>;

function blankToUndefined(value: unknown): unknown {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

function readEnvSource(): Record<string, unknown> {
  const source = import.meta.env;
  return {
    VITE_API_URL: blankToUndefined(source.VITE_API_URL),
    VITE_APP_TITLE: blankToUndefined(source.VITE_APP_TITLE),
    VITE_POLL_OPERATIONAL_MS: blankToUndefined(source.VITE_POLL_OPERATIONAL_MS),
    VITE_POLL_FLEET_MS: blankToUndefined(source.VITE_POLL_FLEET_MS),
    VITE_OUTBOX_SYNC_MS: blankToUndefined(source.VITE_OUTBOX_SYNC_MS),
    VITE_SYNC_BATCH_MAX: blankToUndefined(source.VITE_SYNC_BATCH_MAX),
    VITE_PHOTO_MAX_BYTES: blankToUndefined(source.VITE_PHOTO_MAX_BYTES),
    VITE_DEMO_MODE: blankToUndefined(source.VITE_DEMO_MODE),
    VITE_MEDIA_ORIGINS: blankToUndefined(source.VITE_MEDIA_ORIGINS)
  };
}

function formatIssues(error: z.ZodError): readonly string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "env";
    return `${path}: ${issue.message}`;
  });
}

function normalizeApiUrl(raw: string): string {
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function parseMediaOrigins(raw: string): { origins: readonly string[]; issues: readonly string[] } {
  const origins: string[] = [];
  const issues: string[] = [];
  for (const part of raw.split(",")) {
    const candidate = part.trim();
    if (candidate === "") continue;
    const url = parseSafeUrl(candidate);
    const isBareOrigin = url !== null && url.pathname === "/" && url.search === "" && url.hash === "";
    if (url === null || !isBareOrigin) {
      issues.push(`VITE_MEDIA_ORIGINS memuat origin tidak valid: ${candidate}`);
      continue;
    }
    origins.push(url.origin);
  }
  return { origins, issues };
}

function guardIssues(apiUrl: URL, isProduction: boolean): readonly string[] {
  const issues: string[] = [];
  if (apiUrl.username !== "" || apiUrl.password !== "") {
    issues.push("VITE_API_URL tidak boleh memuat kredensial.");
  }
  if (isProduction && apiUrl.protocol !== "https:") {
    issues.push("VITE_API_URL wajib memakai https pada build produksi.");
  }
  return issues;
}

function resolveSameOrigin(): string | undefined {
  return typeof location === "undefined" ? undefined : location.origin;
}

function buildEnv(source: unknown, isProduction: boolean): EnvBuild {
  const parsed = envSourceSchema.safeParse(source);
  if (!parsed.success) return { ok: false, issues: formatIssues(parsed.error) };
  const data: ParsedSource = parsed.data;
  const apiUrl = normalizeApiUrl(data.VITE_API_URL);
  const api = new URL(apiUrl);
  const media = parseMediaOrigins(data.VITE_MEDIA_ORIGINS);
  const issues = [...guardIssues(api, isProduction), ...media.issues];
  if (issues.length > 0) return { ok: false, issues };
  return {
    ok: true,
    value: Object.freeze({
      ...data,
      VITE_API_URL: apiUrl,
      VITE_MEDIA_ORIGINS: media.origins,
      apiOrigin: api.origin,
      mediaOrigins: buildMediaOrigins(api.origin, media.origins, resolveSameOrigin()),
      isProduction
    })
  };
}

function createBlockedEnv(issues: readonly string[]): AppEnv {
  const failure = new EnvConfigError(issues);
  const target = Object.freeze({}) as AppEnv;
  return new Proxy(target, {
    get(): never {
      throw failure;
    }
  });
}

const envBuild = buildEnv(readEnvSource(), import.meta.env.PROD);

export const envIsValid: boolean = envBuild.ok;
export const envIssues: readonly string[] = envBuild.ok ? [] : envBuild.issues;
export const env: AppEnv = envBuild.ok ? envBuild.value : createBlockedEnv(envBuild.issues);