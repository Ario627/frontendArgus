import { useParams } from "react-router";
import { isApiError } from "@/api/api-error";
import { ReportForm } from "@/features/public-report/components/report-form";
import { ReportReceipt } from "@/features/public-report/components/report-receipt";
import { usePublicSppg } from "@/features/public-report/hooks/use-public-sppg";
import { useSubmitReport } from "@/features/public-report/hooks/use-submit-report";
import { SPPG_SLUG_PATTERN } from "@/features/public-report/report-validation";
import { Skeleton } from "@/shared/components/ui/skeleton";

function InvalidLink() {
  return (
    <div className="flex flex-col gap-2 py-10">
      <h1 className="text-xl font-semibold text-ink">Tautan tidak dikenal</h1>
      <p className="text-sm text-ink-lemah">
        Periksa kembali tautan atau QR yang Anda pindai. Tautan laporan hanya berlaku untuk dapur
        yang terdaftar.
      </p>
    </div>
  );
}

export function PublicReportPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const slugValid = SPPG_SLUG_PATTERN.test(slug);
  const sppgQuery = usePublicSppg(slug);
  const submission = useSubmitReport(slug);

  if (!slugValid) return <InvalidLink />;

  if (sppgQuery.isPending) {
    return (
      <div className="flex flex-col gap-4 py-6">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const apiError = isApiError(sppgQuery.error) ? sppgQuery.error : null;
  if (sppgQuery.isError || sppgQuery.data === undefined) {
    if (apiError !== null && apiError.status === 404) return <InvalidLink />;
    return (
      <div className="flex flex-col gap-3 py-10">
        <h1 className="text-xl font-semibold text-ink">Halaman tidak dapat dimuat</h1>
        <p className="text-sm text-ink-lemah">Periksa jaringan lalu muat ulang halaman ini.</p>
      </div>
    );
  }

  const sppg = sppgQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 border-b border-garis pb-5">
        <h1 className="text-xl font-semibold text-ink">Lapor masalah limbah</h1>
        <p className="text-md text-ink">{sppg.nama}</p>
        {sppg.alamat === null ? null : <p className="text-sm text-ink-lemah">{sppg.alamat}</p>}
      </header>

      {submission.state.phase === "done" && submission.state.result !== null ? (
        <ReportReceipt ticket={submission.state.result} onNewReport={submission.reset} />
      ) : (
        <ReportForm
          sppgName={sppg.nama}
          phase={submission.state.phase}
          error={submission.state.error}
          onSubmit={submission.submit}
        />
      )}
    </div>
  );
}