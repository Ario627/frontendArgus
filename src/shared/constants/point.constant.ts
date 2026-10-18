export const DISTRIBUTION_POINT_KINDS = Object.freeze([
  "sekolah",
  "paud",
  "posyandu",
  "puskesmas",
  "lainnya"
] as const);

export type DistributionPointKind = (typeof DISTRIBUTION_POINT_KINDS)[number];

export const POINT_KIND_LABELS: Readonly<Record<DistributionPointKind, string>> = Object.freeze({
  sekolah: "Sekolah",
  paud: "PAUD",
  posyandu: "Posyandu",
  puskesmas: "Puskesmas",
  lainnya: "Lainnya"
});
