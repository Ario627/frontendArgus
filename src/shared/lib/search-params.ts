export type QueryParamValue = string | number | boolean | undefined | null;

export function toSearchParams(values: Readonly<Record<string, QueryParamValue>>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const serialized = params.toString();
  return serialized === "" ? "" : `?${serialized}`;
}