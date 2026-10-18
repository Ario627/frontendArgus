import type { StatusTone } from "@/shared/constants/tone.constant";
import { EMPTY_CELL } from "@/shared/lib/format";
import type { ParameterKey, ParameterSource } from "@/shared/types/parameter.types";

export const PARAMETER_LABELS: Readonly<Record<ParameterKey, string>> = Object.freeze({
  biaya_per_km: "Biaya angkut per km",
  faktor_muat: "Faktor muat kendaraan",
  biaya_tolak: "Bobot biaya penolakan",
  penalti_umur_per_jam: "Penalti umur per jam",
  susut_wajar_proksi: "Susut wajar pengangkutan",
  toleransi_neraca: "Toleransi neraca massa",
  ambang_proporsi_digit: "Ambang proporsi digit",
  kecepatan_kota_km_jam: "Kecepatan kota"
});

export const PARAMETER_DESCRIPTIONS: Readonly<Record<ParameterKey, string>> = Object.freeze({
  biaya_per_km: "Dipakai skor disposisi untuk menghitung biaya angkut setiap kandidat fasilitas.",
  faktor_muat: "Pengali muatan kendaraan pada perhitungan biaya perjalanan.",
  biaya_tolak: "Peluang penolakan gerbang yang dibobotkan sebagai biaya risiko.",
  penalti_umur_per_jam: "Tambahan biaya untuk setiap jam umur batch pada skor kandidat.",
  susut_wajar_proksi: "Susut berat yang dianggap wajar saat pengangkutan, dipakai neraca massa.",
  toleransi_neraca: "Selisih neraca yang masih diterima sebelum dicatat sebagai anomali.",
  ambang_proporsi_digit: "Batas proporsi digit mencurigakan untuk analisis anomali timbangan.",
  kecepatan_kota_km_jam: "Kecepatan rata-rata kota untuk estimasi waktu tempuh saat optimizer tidak tersedia."
});

export const PARAMETER_SOURCE_LABELS: Readonly<Record<ParameterSource, string>> = Object.freeze({
  literatur: "Literatur",
  kalibrasi_pilot: "Kalibrasi pilot",
  manual_admin: "Manual admin",
  belum_ada: "Belum ada"
});

export const PARAMETER_SOURCE_TONES: Readonly<Record<ParameterSource, StatusTone>> = Object.freeze({
  literatur: "netral",
  kalibrasi_pilot: "daun",
  manual_admin: "kunyit",
  belum_ada: "bata"
});

const VALUE_PATTERN = /^-?\d{1,9}(?:[.,]\d{1,6})?$/;

const valueFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 6 });

export function formatParameterValue(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return EMPTY_CELL;
  return valueFormatter.format(value);
}

export function parseParameterValue(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (!VALUE_PATTERN.test(normalized)) return null;
  return Number(normalized);
}