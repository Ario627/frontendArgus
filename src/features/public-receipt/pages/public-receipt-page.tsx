import { useParams } from "react-router";
import { isApiError } from "@/api/api-error";
import { usePublicStruk } from "@/features/public-receipt/hooks/use-public-struk";
import { FractionBar } from "@/shared/components/data/fraction-bar";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Stamp } from "@/shared/components/ui/stamp";
import { BATCH_STATUS_LABELS } from "@/shared/constants/batch.constant";
import { FLOW_LABELS } from "@/shared/constants/flow.constant";
import type { FractionValues } from "@/shared/constants/fraction.constant";
import { LEDGER_EVENT_LABELS } from "@/shared/constants/ledger.constant";
import { TIER_LABELS } from "@/shared/constants/tier.constant";
import { isDispositionTier } from "@/shared/constants/tier.constant";
import { cn } from "@/shared/lib/cn";
import { formatDateOnly, formatDateTime, formatInt, formatKg, formatTime } from "@/shared/lib/format";
import { isStrukToken, type PublicStrukDto, type StrukFractionDto } from "@/shared/types/struk.types";

function toFractionValues(fraksi: readonly StrukFractionDto[]): FractionValues {
  const values: FractionValues = {};
  for (const entry of fraksi) {
    if (entry.persen > 0) values[entry.kode] = entry.persen;
  }
  return values;
}

function Notice({ title, description }: { readonly title: string; readonly description: string }) {
  return (
    <div className="flex flex-col gap-2 py-10">
      <h1 className="text-xl font-semibold text-ink">{title}</h1>
      <p className="max-w-prose text-sm text-ink-lemah">{description}</p>
    </div>
  );
}

function ReceiptBody({ struk }: { readonly struk: PublicStrukDto }) {
  const tierLabel =
    struk.tingkatPutusan === null
      ? "Belum diputus"
      : isDispositionTier(struk.tingkatPutusan)
        ? `${struk.tingkatPutusan} · ${TIER_LABELS[struk.tingkatPutusan]}`
        : struk.tingkatPutusan;

  return (
    <article className="print-full flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="label-cap text-ink-lemah">Struk limbah</p>
        <h1 className="text-xl font-semibold text-ink">{struk.sppgNama}</h1>
        {struk.sppgAlamat === null ? null : (
          <p className="text-sm text-ink-lemah">{struk.sppgAlamat}</p>
        )}
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-y border-dashed border-ink-lemah/50 py-4">
        <span className="font-mono text-2xl tabular-nums text-ink">{formatKg(struk.beratKg)}</span>
        {struk.gateStatus === null ? null : <Stamp verdict={struk.gateStatus} tilt />}
        <span className="text-sm text-ink-lemah">
          {BATCH_STATUS_LABELS[struk.status]} · {FLOW_LABELS[struk.aliran]}
        </span>
      </div>

      <dl className="flex flex-col">
        <div className="flex items-baseline justify-between gap-4 border-b border-garis py-1.5">
          <dt className="text-xs text-ink-lemah">Waktu catat</dt>
          <dd className="font-mono text-xs tabular-nums text-ink">
            {formatDateOnly(struk.tanggalWib)} {struk.jamWib} WIB
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-b border-garis py-1.5">
          <dt className="text-xs text-ink-lemah">Tingkat putusan</dt>
          <dd className="text-xs text-ink">{tierLabel}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-1.5">
          <dt className="text-xs text-ink-lemah">Rantai ledger</dt>
          <dd className={cn("text-xs", struk.rantaiUtuh ? "text-daun" : "text-bata")}>
            {struk.rantaiUtuh ? "Utuh" : "Timpa terdeteksi"}
            <span className="ml-1.5 font-mono text-ink-lemah">
              {formatInt(struk.jumlahEvent)} peristiwa
            </span>
          </dd>
        </div>
      </dl>

      {struk.fraksi.length === 0 ? null : (
        <section className="flex flex-col gap-2">
          <h2 className="label-cap text-ink-lemah">Komposisi</h2>
          <FractionBar values={toFractionValues(struk.fraksi)} />
        </section>
      )}

      {struk.jejak.length === 0 ? null : (
        <section className="flex flex-col gap-2">
          <h2 className="label-cap text-ink-lemah">Perjalanan</h2>
          <ol className="flex flex-col">
            {struk.jejak.map((entry, index) => (
              <li
                key={`${entry.tipe}-${entry.waktu}-${index}`}
                className="flex items-baseline gap-3 border-b border-garis py-1.5 last:border-b-0"
              >
                <span className="w-12 shrink-0 font-mono text-xs tabular-nums text-ink">
                  {formatTime(entry.waktu)}
                </span>
                <span className="text-sm text-ink">{LEDGER_EVENT_LABELS[entry.tipe]}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <footer className="flex flex-col gap-2 border-t border-garis pt-4">
        {struk.isDemo ? (
          <p className="text-xs text-kunyit">Data demo — bukan catatan operasional sungguhan.</p>
        ) : null}
        <p className="text-xs text-ink-lemah">
          Berlaku sampai {formatDateTime(struk.berlakuSampai)}. Struk tidak menampilkan nama petugas.
        </p>
        <p className="text-xs text-ink-lemah">
          Diterbitkan otomatis oleh ARGUS dari buku besar digital dapur.
        </p>
        <div className="no-print pt-2">
          <Button variant="secondary" onClick={() => window.print()}>
            Cetak / Simpan PDF
          </Button>
        </div>
      </footer>
    </article>
  );
}

export function PublicReceiptPage() {
  const params = useParams();
  const token = typeof params.token === "string" ? params.token : "";
  const query = usePublicStruk(token);
  const apiError = isApiError(query.error) ? query.error : null;

  if (!isStrukToken(token)) {
    return (
      <Notice
        title="Struk tidak dikenal"
        description="Periksa kembali tautan struk yang Anda terima. Minta dapur menerbitkan tautan baru bila perlu."
      />
    );
  }

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-4 py-6">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (query.isError || query.data === undefined) {
    if (apiError?.code === "STRUK_EXPIRED") {
      return (
        <Notice
          title="Struk kedaluwarsa"
          description="Tautan struk sudah melewati masa berlaku. Minta dapur menerbitkan tautan baru."
        />
      );
    }
    if (apiError?.code === "STRUK_NOT_FOUND") {
      return (
        <Notice
          title="Struk tidak ditemukan"
          description="Tautan struk tidak cocok dengan catatan mana pun. Periksa kembali tautan yang Anda terima."
        />
      );
    }
    return (
      <Notice
        title="Struk tidak dapat dimuat"
        description={apiError?.message ?? "Periksa jaringan lalu muat ulang halaman ini."}
      />
    );
  }

  return <ReceiptBody struk={query.data} />;
}