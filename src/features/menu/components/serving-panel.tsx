import { useState } from "react";
import { isApiError } from "@/api/api-error";
import { useCreateServing } from "@/features/menu/hooks/use-create-serving";
import { useMenuItems } from "@/features/menu/hooks/use-menu-items";
import { useMenuServings } from "@/features/menu/hooks/use-menu-servings";
import { useSppgDetail } from "@/features/sppg/hooks/use-sppg-detail";
import { useSppgList } from "@/features/sppg/hooks/use-sppg-list";
import { Button } from "@/shared/components/ui/button";
import { Select } from "@/shared/components/ui/select";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { MENU_COMPONENT_LABELS } from "@/shared/constants/menu.constant";
import { wibIsoDate } from "@/shared/lib/format";

export interface ServingPanelProps {
  readonly sppgId: string | null;
  readonly canAdd: boolean;
  readonly canChooseSppg: boolean;
}

export function ServingPanel({ sppgId, canAdd, canChooseSppg }: ServingPanelProps) {
  const today = wibIsoDate(0);
  const [choice, setChoice] = useState("");
  const sppgList = useSppgList(true, { enabled: canChooseSppg });
  const effectiveSppgId = canChooseSppg ? (choice === "" ? null : choice) : sppgId;

  const servings = useMenuServings({
    tanggal: today,
    ...(effectiveSppgId === null ? {} : { sppgId: effectiveSppgId }),
    limit: 100
  });
  const items = useMenuItems(true);
  const points = useSppgDetail(canAdd ? effectiveSppgId : null);
  const create = useCreateServing();
  const showToast = useToastStore((state) => state.show);
  const [menuItemId, setMenuItemId] = useState("");
  const [titikId, setTitikId] = useState("");

  const itemName = new Map((items.data?.items ?? []).map((item) => [item.id, item]));
  const pointName = new Map((points.data?.points ?? []).map((point) => [point.id, point.nama]));
  const rows = servings.data?.items ?? [];

  const submit = () => {
    if (menuItemId === "" || effectiveSppgId === null) return;
    create.mutate(
      {
        tanggal: today,
        sppgId: effectiveSppgId,
        menuItemId,
        ...(titikId === "" ? {} : { titikId })
      },
      {
        onSuccess: (result) => {
          showToast({
            message: result.duplicate
              ? "Penyajian ini sudah tercatat sebelumnya."
              : "Penyajian tercatat."
          });
          setMenuItemId("");
          setTitikId("");
        },
        onError: (cause) => {
          showToast({
            message: isApiError(cause) ? cause.message : "Penyajian tidak dapat dicatat.",
            tone: "bata"
          });
        }
      }
    );
  };

  return (
    <section className="flex flex-col gap-3 rounded-kontainer border border-garis px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-ink">Sajian hari ini</h2>
        <span className="font-mono text-2xs text-ink-lemah">{rows.length} catatan</span>
      </div>

      {canChooseSppg ? (
        <label className="flex max-w-64 flex-col gap-1">
          <span className="label-cap text-ink-lemah">Dapur</span>
          <Select
            aria-label="Pilih SPPG"
            value={choice}
            onChange={(event) => {
              setChoice(event.target.value);
              setTitikId("");
            }}
          >
            <option value="">Semua dapur</option>
            {(sppgList.data?.items ?? []).map((sppg) => (
              <option key={sppg.id} value={sppg.id}>
                {sppg.nama}
              </option>
            ))}
          </Select>
        </label>
      ) : null}

      {servings.isPending ? <p className="text-sm text-ink-lemah">Memuat sajian...</p> : null}

      {servings.isError ? <p className="text-sm text-bata">Sajian tidak dapat dimuat.</p> : null}

      {!servings.isPending && rows.length === 0 ? (
        <p className="text-sm text-ink-lemah">
          Belum ada sajian untuk hari ini. Catat menu yang disajikan agar observasi sisa bisa
          ditelusuri sampai menu asalnya.
        </p>
      ) : null}

      {rows.length > 0 ? (
        <ul className="flex flex-col">
          {rows.map((serving) => {
            const item = itemName.get(serving.menuItemId);
            return (
              <li
                key={serving.id}
                className="flex items-center justify-between gap-3 border-b border-garis py-2 last:border-b-0"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm text-ink">{item?.nama ?? "Item"}</span>
                  <span className="text-xs text-ink-lemah">
                    {item === undefined ? "" : MENU_COMPONENT_LABELS[item.komponen]}
                    {serving.titikId === null
                      ? " · semua titik"
                      : ` · ${pointName.get(serving.titikId) ?? "titik"}`}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {canAdd ? (
        <div className="flex flex-col gap-2 border-t border-garis pt-3">
          {effectiveSppgId === null ? (
            <p className="text-xs text-ink-lemah">
              Pilih dapur lebih dulu untuk mencatat penyajian.
            </p>
          ) : null}
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex min-w-40 flex-1 flex-col gap-1">
              <span className="label-cap text-ink-lemah">Menu</span>
              <Select
                aria-label="Menu yang disajikan"
                value={menuItemId}
                onChange={(event) => setMenuItemId(event.target.value)}
              >
                <option value="">Pilih menu</option>
                {(items.data?.items ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex min-w-40 flex-1 flex-col gap-1">
              <span className="label-cap text-ink-lemah">Titik</span>
              <Select
                aria-label="Titik distribusi"
                value={titikId}
                onChange={(event) => setTitikId(event.target.value)}
              >
                <option value="">Semua titik</option>
                {(points.data?.points ?? [])
                  .filter((point) => point.aktif)
                  .map((point) => (
                    <option key={point.id} value={point.id}>
                      {point.nama}
                    </option>
                  ))}
              </Select>
            </label>
            <Button
              size="sm"
              className="mb-0.5"
              disabled={menuItemId === "" || effectiveSppgId === null}
              loading={create.isPending}
              onClick={submit}
            >
              Catat
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
