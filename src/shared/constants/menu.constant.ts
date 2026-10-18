export const MENU_COMPONENTS = Object.freeze([
  "karbohidrat",
  "protein",
  "sayur",
  "buah",
  "susu",
  "lainnya"
] as const);

export type MenuComponent = (typeof MENU_COMPONENTS)[number];

export const MENU_COMPONENT_LABELS: Readonly<Record<MenuComponent, string>> = Object.freeze({
  karbohidrat: "Karbohidrat",
  protein: "Protein",
  sayur: "Sayur",
  buah: "Buah",
  susu: "Susu",
  lainnya: "Lainnya"
});

export const INSIGHT_SAMPLE_MIN = 30;

export const INSIGHT_METHOD_LINEAR = "linear_0_4";

export type InsightConfidence = "rendah" | "cukup";

export const INSIGHT_CONFIDENCE_LABELS: Readonly<Record<InsightConfidence, string>> = Object.freeze({
  rendah: "Keyakinan rendah",
  cukup: "Keyakinan cukup"
});

const MENU_COMPONENT_SET: ReadonlySet<string> = new Set(MENU_COMPONENTS);

export function isMenuComponent(value: unknown): value is MenuComponent {
  return typeof value === "string" && MENU_COMPONENT_SET.has(value);
}