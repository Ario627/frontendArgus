# ARGUS Frontend

Antarmuka ARGUS: tempat staf SPPG mencatat batch limbah, pengemudi menjalankan rute, fasilitas menerima serah terima, dan DLH mengaudit bukti. Ini bukan dashboard dekoratif — setiap layar berakhir pada satu tindakan yang meninggalkan jejak di buku besar.

Frontend tidak menyimpan aturan bisnis. Gerbang mutu, skor disposisi, dan keputusan fasilitas dievaluasi backend; klien hanya menampilkan alasan, meminta konfirmasi, dan mengirim bukti.

## Daftar Isi

- [1. Stack](#1-stack)
- [2. Mulai cepat](#2-mulai-cepat)
- [3. Struktur folder](#3-struktur-folder)
- [4. Rute dan peran](#4-rute-dan-peran)
- [5. Integrasi API](#5-integrasi-api)
- [6. Mode lapangan dan antrean offline](#6-mode-lapangan-dan-antrean-offline)
- [7. Foto bukti](#7-foto-bukti)
- [8. Navigasi pengemudi](#8-navigasi-pengemudi)
- [9. Peta dan ubin](#9-peta-dan-ubin)
- [10. Sistem desain](#10-sistem-desain)
- [11. PWA dan cache](#11-pwa-dan-cache)
- [12. Environment](#12-environment)
- [13. Verifikasi dan tes](#13-verifikasi-dan-tes)
- [14. Bangun dan sajikan](#14-bangun-dan-sajikan)
- [15. Jebakan yang sudah pernah menggigit](#15-jebakan-yang-sudah-pernah-menggigit)
- [16. Dokumentasi terkait](#16-dokumentasi-terkait)

## 1. Stack

| Komponen | Versi | Catatan |
|---|---|---|
| React | 19.3 | `StrictMode` aktif di dev |
| Vite | 8.3.4 | Rolldown; `strictPort` di 3000 |
| TypeScript | 6.0 | `tsc -b` dengan project references |
| Tailwind CSS | 4.3 | Konfigurasi CSS-first lewat `@theme`, tanpa `tailwind.config.js` |
| TanStack Query | 5.104 | Semua data server; `useEffect` hanya untuk langganan peramban (geolokasi, suara) dan sinkronisasi form |
| Zustand | 5.0 | Sesi auth, antrean outbox, dan toast — tidak untuk data server |
| React Hook Form + Zod | 7.90 / 4.6 | Validasi form di klien, cermin DTO backend |
| React Router | 8.4 | `createBrowserRouter` + `lazy` per halaman |
| Leaflet + react-leaflet | 1.9 / 5.0 | Dimuat sebagai chunk terpisah |
| axios | 1.20 | Satu instance `http` dengan interceptor |
| idb | 8.0 | Antrean offline (outbox) |
| vite-plugin-pwa | 2.0 | Precache shell, service worker `prompt` |

## 2. Mulai cepat

```bash
pnpm install
cp .env.example .env.development
pnpm dev
```

Aplikasi di `http://localhost:3000`. Backend harus hidup di `http://localhost:3001` dengan prefix `/api/v1`.

Verifikasi wajib sebelum commit:

```bash
pnpm exec tsc -b
pnpm exec eslint . --max-warnings=0
pnpm build
```

`pnpm build` menjalankan `tsc -b` lalu `vite build`. Keduanya harus bersih; tidak ada peringatan yang dibiarkan.

## 3. Struktur folder

```
src/
├── api/                 http client, normalisasi error, tipe envelope
├── app/                 router, providers, query client, error boundary
├── features/            26 folder fitur, satu folder = satu domain layar
│   ├── auth/            login, guard, penyimpanan sesi
│   ├── field-capture/   catat batch (staf SPPG), daftar batch hari ini
│   ├── photo/           kompresi, unggah, tampilan foto bukti
│   ├── navigation/      rute pengemudi: alternatif, warna, suara
│   ├── dispatch/        antrean penugasan batch ke armada
│   ├── dashboard/       ringkasan, narasi, perbandingan keputusan
│   ├── devices/         pendaftaran perangkat, kredensial sekali tampil
│   ├── scale/           penautan penimbangan tertunda
│   ├── sppg/            master dapur dan titik distribusi
│   ├── facilities/      master fasilitas dan profil penerimaan
│   ├── fleet/           master armada dan posisi terakhir
│   ├── diagnostics/     kesehatan layanan, rantai, retensi
│   └── ...              batch, ledger, anomalies, audit, tickets, routes,
│                        menu, disposition, parameters, export, outbox,
│                        public-report, public-receipt, landing
└── shared/
    ├── components/      ui (button, dialog, sheet, chip, stamp), data, layout
    ├── constants/       label dan matriks peran, kode status, tier, tone
    ├── hooks/           use-online, use-delayed-loading
    ├── lib/             env, format, hash, outbox-db, map-tiles, url-safety, cn
    ├── styles/          index.css: token @theme, utility, komponen dasar
    └── types/           kontrak tipe per domain
```

Aturan yang dipegang: satu fitur tidak mengimpor dari fitur lain kecuali lewat `shared/`. Tipe kontrak ada di `shared/types/`, bukan di dalam komponen.

## 4. Rute dan peran

Lima peran: `admin`, `dlh_auditor`, `sppg_staff`, `driver`, `facility`.

| Rute | Layout | Peran |
|---|---|---|
| `/`, `/login` | — | publik |
| `/catat`, `/batch-hari-ini`, `/timbangan` | `FieldLayout` | `sppg_staff` |
| `/antrean` | `FieldLayout` | `sppg_staff`, `driver`, `facility` |
| `/fasilitas-masuk` | `FieldLayout` | `facility` |
| `/rute-hari-ini` | `FieldLayout` | `driver` |
| `/dashboard`, `/batches`, `/batches/:id`, `/ledger`, `/anomalies`, `/audit`, `/facilities`, `/dispositions`, `/dispatch`, `/menu`, `/tickets`, `/tickets/:id`, `/routes`, `/routes/:id`, `/export`, `/fleet`, `/parameters`, `/devices`, `/sppg`, `/diagnostik` | `ConsoleLayout` | `admin`, `dlh_auditor`, `sppg_staff` |
| `/lapor/:slug`, `/struk/:token` | `PublicLayout` | publik |
| `*` | — | halaman tidak ditemukan |

Guard berlapis: `RequireAuth` memeriksa token, `RequireRole` memeriksa peran. Cakupan data (mis. staf hanya melihat dapur sendiri) tetap ditegakkan backend — frontend tidak dianggap sebagai batas keamanan.

`FieldLayout` memakai `max-w-5xl` dan `FieldTabBar` sehingga jempol mencapai tab; `ConsoleLayout` memakai `max-w-6xl` dengan padding `px-4 md:px-8 xl:px-12`.

## 5. Integrasi API

Satu instance axios di `src/api/axios-client.ts`:

| Perilaku | Detail |
|---|---|
| Base URL | `env.VITE_API_URL` di setiap request, bukan saat modul dimuat |
| Token | Diambil dari `useAuthStore` pada request, bukan disalin sekali |
| Envelope | `{ success, data }` dibuka oleh interceptor; `rawResponse` untuk respons di luar envelope |
| Error | Dinormalisasi menjadi `ApiError { status, code, message }` — layar menampilkan `message`, bukan teks teknis |
| 401 | Hanya bila request membawa `Authorization` — memaksa logout dengan alasan `sesi-berakhir` |
| Timeout | 15 detik |
| Unduhan | `apiBlob` untuk CSV/PDF, `responseType: "blob"` |

Query key selalu berupa array berawalan domain (`["batches", filter]`), sehingga invalidasi tepat sasaran setelah mutasi: gate, putusan, tugaskan, konfirmasi stop, unggah foto.

Polling dibatasi dan sadar-tab:

| Data | Interval | Sumber |
|---|---|---|
| Daftar operasional (batch, tiket, antrean) | `VITE_POLL_OPERATIONAL_MS` (60 dtk) | `use-batches`, antrean lain |
| Telemetri armada | `VITE_POLL_FLEET_MS` (30 dtk) | `use-fleet-telemetry` |
| Sinkron outbox | `VITE_OUTBOX_SYNC_MS` (60 dtk) | `use-outbox-triggers` |

Default `QueryClient` (`app/query-client.ts`):

| Opsi | Nilai | Alasan |
|---|---|---|
| `staleTime` | 30 detik | Data operasional berubah, tetapi tidak setiap detik |
| `gcTime` | 24 jam | Kembali ke layar sebelumnya tidak memuat ulang dari nol |
| `retry` | 2, hanya untuk status `0`, `408`, atau `>= 500` | 4xx tidak diulang — mengulang penolakan tidak mengubah hasil |
| `refetchOnWindowFocus` | `true` | Tab yang kembali aktif menyegarkan tampilan |
| `refetchIntervalInBackground` | default `false` | Polling berhenti saat tab tidak aktif |
| `networkMode` | `offlineFirst` | Mutasi menunggu jaringan, bukan langsung gagal |
| Error | Dicatat hanya bila status `0` atau `>= 500` | 4xx adalah jawaban sah, bukan insiden |

## 6. Mode lapangan dan antrean offline

Pencatatan batch dirancang untuk sinyal buruk:

1. `batchId` dibuat di klien (`uuid7`) sebelum unggah, sehingga foto dan batch memakai `refId` yang sama meski jaringan putus di tengah jalan.
2. Bila unggah foto gagal, pengguna diberi dua pilihan jujur: coba kirim foto lagi, atau simpan batch tanpa foto. Batch tidak pernah "hilang diam-diam".
3. Batch yang gagal terkirim masuk outbox IndexedDB (`shared/lib/outbox-db.ts`) dengan `clientEventId`; backend memperlakukan duplikat sebagai sukses idempoten (`duplicate: true`).
4. Halaman `/antrean` menampilkan isi outbox, alasan gagal, dan tombol kirim ulang. Sinkron otomatis berjalan saat `online` kembali dan saat tab aktif.
5. `VITE_SYNC_BATCH_MAX` membatasi jumlah item per putaran agar tidak menumpuk satu permintaan besar.

`OfflineBanner` muncul dari `use-online`, bukan dari kegagalan request pertama — indikator tidak boleh berbohong.

## 7. Foto bukti

| Aspek | Nilai |
|---|---|
| Target ukuran berkas | 1,5 MB (`DEFAULT_MAX_BYTES`) |
| Sisi terpanjang | 1920 px (`DEFAULT_MAX_DIMENSION`); gambar lebih kecil tidak diperbesar |
| Urutan format | WebP, jatuh ke JPEG bila tidak didukung |
| Kualitas bertingkat | 0,92 → 0,86 → 0,80 → 0,72 → 0,64 → 0,55 sampai target tercapai |
| Batas server | 2 MB (`PHOTO_MAX_BYTES` di backend) |

`VITE_PHOTO_MAX_BYTES` sudah ada di skema environment tetapi **belum dipakai** oleh modul kompresi — batas yang berlaku saat ini adalah konstanta 1,5 MB di atas. Jangan mengandalkan variabel itu untuk menurunkan batas sampai pemakaiannya benar-benar disambungkan.

Dua input berkas hidup permanen di `photo-capture-field.tsx`: satu dengan `capture="environment"` untuk kamera, satu tanpa atribut itu untuk galeri. Keduanya dipicu lewat `ref.click()`, lalu `input.value` direset setelah dipilih. Input tidak pernah di-remount — mengganti `key` membuat dialog sistem mengembalikan berkas ke elemen yang sudah terlepas, dan unggahan tidak pernah terjadi.

Foto disajikan lewat URL bertanda tangan milik backend (`/photos/file/:sha256?exp=&sig=`, berlaku 900 detik), bukan URL storage mentah. Klien tidak perlu tahu penyimpanan mana yang dipakai.

## 8. Navigasi pengemudi

`/rute-hari-ini` menampilkan semua stop hari itu beserta alternatif rute:

- Semua alternatif digambar, bukan hanya yang terpilih; warna mengikuti `congestion` (`lancar`, `padat`, `macet`).
- Pemilih alternatif menampilkan jarak, waktu tempuh, dan jumlah ruas padat.
- Posisi pengemudi diambil dari `navigator.geolocation` dengan `watchPosition`, dipakai untuk menghitung indeks stop berikutnya.
- Panduan suara memakai `SpeechSynthesis` dan hanya diumumkan sekali per ambang (400 m, 150 m, 60 m, tiba).
- Suara **wajib** dimulai dari gestur pengguna (tombol "Mulai navigasi"); tanpa gestur, peramban menolak dan tidak ada suara sama sekali.
- Bila penyedia rute gagal, layar menampilkan garis lurus dan menyebutnya apa adanya: estimasi jarak lurus, bukan rute lalu lintas.

## 9. Peta dan ubin

| Variabel | Default |
|---|---|
| `VITE_MAP_TILE_URL` | `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png` |
| `VITE_MAP_TILE_LABEL` | `CARTO / OpenStreetMap` (atau `kustom` bila URL diisi) |

Ubin hanya untuk visual. Perhitungan rute dilakukan backend (Google Routes → Mapbox → OSRM → garis lurus). Mengganti penyedia ubin tidak mengubah angka jarak maupun waktu.

Leaflet dimuat lewat `lazy` dan dipecah ke chunk `map`, sehingga pengguna yang tidak membuka peta tidak mengunduhnya.

## 10. Sistem desain

Token warna di `shared/styles/index.css` (`@theme` Tailwind 4):

| Token | Nilai | Pakai |
|---|---|---|
| `kertas` | `#f7f7f5` | latar utama |
| `ink` / `ink-lemah` | `#17191c` / `#5c6166` | teks utama / sekunder |
| `garis` | `#e4e5e7` | batas, garis bantu |
| `biru-tinta` | `#24425e` | aksi utama, fokus |
| `daun` / `kunyit` / `bata` | `#4f6b45` / `#a8721f` / `#a63d2f` | aman / perhatian / bahaya |
| `fraksi-a` … `fraksi-e` | hijau–abu | komposisi fraksi batch |

Tipografi: `Instrument Sans` untuk UI, `IBM Plex Mono` untuk angka, hash, dan kode — angka monospace membuat kolom berat dan hash bisa dibandingkan mata.

Utility khas: `bg-grid-teknis` (kertas milimeter), `bg-ruled` (garis tulis), `bg-ruler-minor` / `bg-ruler-major` (penggaris timbangan), `label-cap` (label huruf kapital berspasi). Ikon `lucide-react` dipakai hanya bila menyampaikan arti, tidak sebagai hiasan. Tanpa emoji.

## 11. PWA dan cache

- `registerType: "prompt"` — pembaruan service worker tidak pernah memaksa reload di tengah pengisian form.
- Precache: `js`, `css`, `html`, `svg`, `woff2`, `png`.
- `navigateFallback` `/index.html`, kecuali jalur `/api/`.
- Runtime cache: data referensi (`sppg`, `facilities`, `menu/items`, `parameters`) memakai `NetworkFirst` 3 detik lalu fallback cache; ubin CARTO `CacheFirst` 30 hari.
- Data operasional (batch, tiket, anomali) **tidak** di-cache — angka basi lebih berbahaya daripada layar kosong.

Ikon PWA dihasilkan oleh `pnpm icons:generate` (skrip `scripts/generate-icons.mjs`) ke `public/icons/`.

## 12. Environment

| Variabel | Wajib | Default | Arti |
|---|---|---|---|
| `VITE_API_URL` | ya | — | URL penuh API, termasuk `/api/v1` |
| `VITE_APP_TITLE` | tidak | `ARGUS` | Judul dokumen |
| `VITE_POLL_OPERATIONAL_MS` | tidak | `60000` | Polling daftar operasional |
| `VITE_POLL_FLEET_MS` | tidak | `30000` | Polling telemetri armada |
| `VITE_OUTBOX_SYNC_MS` | tidak | `60000` | Interval sinkron outbox |
| `VITE_SYNC_BATCH_MAX` | tidak | `50` | Item maksimum per sinkron |
| `VITE_PHOTO_MAX_BYTES` | tidak | `1048576` | Batas berkas foto; **belum dipakai** modul kompresi (lihat §7) |
| `VITE_DEMO_MODE` | tidak | `false` | Tampilkan penanda data demo |
| `VITE_MEDIA_ORIGINS` | tidak | kosong | Origin tambahan yang boleh memuat media |
| `VITE_MAP_TILE_URL` | tidak | CARTO | Templat ubin peta |
| `VITE_MAP_TILE_LABEL` | tidak | otomatis | Label atribusi ubin |

Validasi dilakukan `shared/lib/env.ts` dengan Zod saat modul dimuat. Nilai tidak sah tidak menghasilkan layar rusak setengah jalan: aplikasi menampilkan `ConfigErrorScreen` yang menyebut variabel mana yang salah.

Variabel dibaca saat build, bukan saat runtime. Mengubah `.env` menuntut restart `pnpm dev` atau build ulang untuk produksi.

## 13. Verifikasi dan tes

```bash
pnpm exec tsc -b                      # typecheck seluruh project reference
pnpm exec eslint . --max-warnings=0   # termasuk aturan react-hooks dan react-compiler
pnpm build                            # produksi
pnpm test                             # vitest (watch)
pnpm test:run                         # vitest sekali jalan
```

Unit test saat ini fokus pada fungsi murni di `shared/lib` (format angka, JWT, waktu kejadian, input fraksi). Playwright sudah terpasang sebagai dependensi tetapi belum ada berkas skenario — `pnpm test:e2e` belum menjadi gerbang mutu. Verifikasi alur nyata dilakukan manual terhadap backend hidup.

## 14. Bangun dan sajikan

```bash
pnpm build           # keluaran ke dist/
pnpm preview         # cek hasil build di port 3000
```

Untuk penyajian produksi, konfigurasikan reverse proxy agar semua jalur non-aset diarahkan ke `index.html` (router memakai history API), dan biarkan `/api/` diteruskan ke backend. Tanpa aturan itu, membuka `/batches` lewat tautan langsung akan menghasilkan 404.

## 15. Jebakan yang sudah pernah menggigit

| Gejala | Sebab | Perbaikan yang dipakai |
|---|---|---|
| Tombol pilih foto tidak bereaksi | input di-remount lewat `key` sebelum dialog sistem selesai | dua input permanen + `ref.click()` + reset `value` |
| Peringatan `react-compiler`: setState di dalam effect | menyelaraskan state turunan | pola derived-state-saat-render (`if (open !== lastOpen) { ... }`) |
| Peringatan `react-compiler`: akses ref saat render | membaca `ref.current` untuk keputusan tampilan | state biasa, bukan ref |
| Peringatan `react-compiler`: `Date.now()` saat render | membuat objek waktu di badan komponen | bentuk objek di dalam event handler |
| Nilai `form.watch()` tidak memicu render ulang dengan benar | langganan seluruh form | `useWatch({ control, name })` |
| Angka berat tampak bergeser 0,01 kg | pembulatan di tengah rantai | simpan sebagai angka, format hanya saat tampil (`formatKg`) |
| Peta kosong setelah pindah rute | kontainer Leaflet belum berukuran | `invalidateSize` setelah layout stabil |

## 16. Dokumentasi terkait

| Berkas | Isi |
|---|---|
| `docs/01-stack-dan-struktur-proyek.md` | Keputusan stack dan pembagian folder |
| `docs/02-routing-rbac-dan-styling.md` | Matriks rute, peran, dan token desain |
| `docs/03-state-dan-integrasi-api.md` | Konvensi query, mutasi, dan penanganan error |
| `docs/04-form-dan-kontrak-tipe.md` | RHF + Zod dan pemetaan DTO |
| `docs/05-performa-dan-pola-ux.md` | Lazy loading, polling, pola layar lapangan |
| `docs/06-testing-keamanan-dan-operasional.md` | Gerbang mutu dan batas keamanan klien |
| `docs/08-desain-dan-anti-ai-slop.md` | Aturan visual yang dipegang |
| `../backend/README.md` | Kontrak API, status, dan kode error |
| `../python/README.md` | Optimizer rute dan layanan analitik |


