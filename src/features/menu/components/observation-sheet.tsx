import { useState } from "react";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Sheet } from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { LeftoverScalePicker } from "@/features/menu/components/leftover-scale-picker";
import { useCreateObservation } from "@/features/menu/hooks/use-create-observation";
import { useMenuItems } from "@/features/menu/hooks/use-menu-items";
import { useObservationPoints } from "@/features/menu/hooks/use-observation-points";
import { LEFTOVER_LABELS, type LeftoverLevel } from "@/shared/constants/leftover.constant";
import { MENU_COMPONENT_LABELS } from "@/shared/constants/menu.constant";
import { wibIsoDate } from "@/shared/lib/format";

export interface ObservationSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly sppgId: string | null;
}

function parsePortions(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d{1,9}$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return value >= 1 ? value : null;
}

export function ObservationSheet({ open, onOpenChange, sppgId }: ObservationSheetProps) {
  const pointsQuery = useObservationPoints(open ? sppgId : null);
  const itemsQuery = useMenuItems(true);
  const createObservation = useCreateObservation();
  const showToast = useToastStore((state) => state.show);

  const [tanggal, setTanggal] = useState(wibIsoDate(0));
  const [titikId, setTitikId] = useState("");
  const [menuItemId, setMenuItemId] = useState("");
  const [level, setLevel] = useState<LeftoverLevel | null>(null);
  const [portionsText, setPortionsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setTanggal(wibIsoDate(0));
      setTitikId("");
      setMenuItemId("");
      setLevel(null);
      setPortionsText("");
      setError(null);
    }
  }

  const points = pointsQuery.data ?? [];
  const items = itemsQuery.data?.items ?? [];
  const today = wibIsoDate(0);

  const submit = () => {
    setError(null);
    if (tanggal === "" || tanggal > today) {
      setError("Tanggal tidak boleh di masa depan.");
      return;
    }
    if (titikId === "") {
      setError("Pilih titik distribusi.");
      return;
    }
    if (menuItemId === "") {
      setError("Pilih item menu.");
      return;
    }
    if (level === null) {
      setError("Pilih tingkat sisa.");
      return;
    }
    const portions = parsePortions(portionsText);
    if (portions === null) {
      setError("Isi jumlah porsi yang dinilai (minimal 1).");
      return;
    }
    createObservation.mutate(
      { tanggal, titikId, menuItemId, tingkatSisa: level, jumlahPorsiDinilai: portions },
      {
        onSuccess: (result) => {
          showToast({
            message:
              result.outcome === "terkirim"
                ? `Observasi tersimpan (${LEFTOVER_LABELS[level]})`
                : "Observasi tersimpan — menunggu sinkron"
          });
          onOpenChange(false);
        },
        onError: () => {
          setError("Tidak dapat menyimpan di perangkat. Coba lagi.");
        }
      }
    );
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Catat observasi sisa"
      description="Amati sisa di titik distribusi setelah makan, lalu isi sesuai piring nyata."
      footer={
        <Button size="lg" fullWidth loading={createObservation.isPending} onClick={submit}>
          Simpan observasi
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <Field label="Tanggal">
          {(control) => (
            <Input
              id={control.id}
              aria-describedby={control.describedBy}
              type="date"
              max={today}
              value={tanggal}
              onChange={(event) => setTanggal(event.target.value)}
            />
          )}
        </Field>

        <Field label="Titik distribusi" required>
          {(control) =>
            points.length === 0 ? (
              <p className="text-sm text-kunyit">
                Belum ada titik distribusi untuk dapur ini. Hubungi admin untuk menambah titik.
              </p>
            ) : (
              <Select
                id={control.id}
                aria-describedby={control.describedBy}
                value={titikId}
                onChange={(event) => setTitikId(event.target.value)}
              >
                <option value="">Pilih titik</option>
                {points.map((point) => (
                  <option key={point.id} value={point.id}>
                    {point.nama}
                  </option>
                ))}
              </Select>
            )
          }
        </Field>

        <Field label="Item menu" required>
          {(control) =>
            items.length === 0 ? (
              <p className="text-sm text-kunyit">
                Belum ada item menu. Minta admin menambah item terlebih dahulu.
              </p>
            ) : (
              <Select
                id={control.id}
                aria-describedby={control.describedBy}
                value={menuItemId}
                onChange={(event) => setMenuItemId(event.target.value)}
              >
                <option value="">Pilih item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama} — {MENU_COMPONENT_LABELS[item.komponen]}
                  </option>
                ))}
              </Select>
            )
          }
        </Field>

        <LeftoverScalePicker value={level} onChange={setLevel} invalid={error !== null && level === null} />

        <Field label="Jumlah porsi dinilai" required hint="Berapa porsi yang Anda amati di titik ini.">
          {(control) => (
            <Input
              id={control.id}
              aria-describedby={control.describedBy}
              inputMode="numeric"
              autoComplete="off"
              placeholder="Contoh: 120"
              value={portionsText}
              onChange={(event) => setPortionsText(event.target.value)}
            />
          )}
        </Field>

        {error === null ? null : (
          <p role="alert" className="text-sm text-bata">
            {error}
          </p>
        )}
      </div>
    </Sheet>
  );
}