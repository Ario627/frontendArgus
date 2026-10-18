export const WASTE_FLOWS = Object.freeze(["organik", "minyak"] as const);

export type WasteFlow = (typeof WASTE_FLOWS)[number];

export const FLOW_LABELS: Readonly<Record<WasteFlow, string>> = Object.freeze({
  organik: "Organik",
  minyak: "Minyak"
});

export const MOISTURE_PROXIES = Object.freeze(["kering", "sedang", "basah"] as const);

export type MoistureProxy = (typeof MOISTURE_PROXIES)[number];

export const MOISTURE_LABELS: Readonly<Record<MoistureProxy, string>> = Object.freeze({
  kering: "Kering",
  sedang: "Sedang",
  basah: "Basah"
});

const FLOW_SET: ReadonlySet<string> = new Set(WASTE_FLOWS);
const MOISTURE_SET: ReadonlySet<string> = new Set(MOISTURE_PROXIES);

export function isWasteFlow(value: unknown): value is WasteFlow {
  return typeof value === "string" && FLOW_SET.has(value);
}

export function isMoistureProxy(value: unknown): value is MoistureProxy {
  return typeof value === "string" && MOISTURE_SET.has(value);
}