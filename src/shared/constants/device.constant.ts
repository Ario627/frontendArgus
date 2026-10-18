export const DEVICE_TYPES = Object.freeze(["tracker", "timbangan"] as const);

export type DeviceType = (typeof DEVICE_TYPES)[number];

export const DEVICE_TYPE_LABELS: Readonly<Record<DeviceType, string>> = Object.freeze({
  tracker: "Pelacak",
  timbangan: "Timbangan"
});

const DEVICE_TYPE_SET: ReadonlySet<string> = new Set(DEVICE_TYPES);

export function isDeviceType(value: unknown): value is DeviceType {
  return typeof value === "string" && DEVICE_TYPE_SET.has(value);
}