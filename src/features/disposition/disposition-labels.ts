export const DECISION_REASON_LABELS: Readonly<Record<string, string>> = Object.freeze({
  SKOR_TERENDAH: "Skor terendah di antara kandidat layak",
  NO_ELIGIBLE_CANDIDATE: "Tidak ada kandidat yang layak",
  PARAMETER_BELUM_TERKALIBRASI: "Parameter belum terkalibrasi — jalur aman T4"
});

export const INELIGIBILITY_LABELS: Readonly<Record<string, string>> = Object.freeze({
  GATE_TOLAK: "Gerbang menolak batch ini",
  MELEWATI_BATAS_UMUR: "Melewati batas umur fasilitas",
  KAPASITAS_PENUH: "Kapasitas fasilitas penuh"
});

export const INELIGIBILITY_TONES: Readonly<Record<string, string>> = Object.freeze({
  GATE_TOLAK: "text-bata",
  MELEWATI_BATAS_UMUR: "text-kunyit",
  KAPASITAS_PENUH: "text-kunyit"
});

export const CANDIDATE_NOTE_LABELS: Readonly<Record<string, string>> = Object.freeze({
  P_TOLAK_ASUMSI: "peluang tolak diasumsikan",
  PARAMETER_BELUM_TERKALIBRASI: "parameter belum terkalibrasi"
});

export const PARAMETER_LABELS: Readonly<Record<string, string>> = Object.freeze({
  biayaPerKm: "Biaya per km",
  faktorMuat: "Faktor muat",
  biayaTolak: "Peluang tolak",
  penaltiUmurPerJam: "Penalti umur per jam",
  kecepatanKotaJam: "Kecepatan kota"
});