import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Ban } from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
import { StatusBadge } from "../../../shared/components/ui/status-badge";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../shared/components/ui/dialog";
import { FleetForm } from "../components/fleet-form";
import { DeleteConfirmDialog } from "../../../shared/components/feedback/confirm-dialog";
import { RevokeDeviceDialog } from "../components/revoke-device-dialog";
import { useFleetDetail } from "../hooks/use-fleet-detail";
import { useDeleteFleet } from "../hooks/use-delete-fleet";
import { useUpdateFleet } from "../hooks/use-update-fleet";
import { useRevokeDevice } from "../hooks/use-revoke-device";
import { useAuthStore } from "../../auth/store/auth.store";
import type { UpdateFleetFormValues } from "../schemas/update-fleet.schema";

export function FleetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const canModify = user?.role === "admin";

  const { data: fleet, isLoading, isError, refetch } = useFleetDetail(id);
  const deleteMutation = useDeleteFleet();
  const updateMutation = useUpdateFleet({ id: id ?? "" });
  const revokeMutation = useRevokeDevice({ id: id ?? "" });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (isError || !fleet) {
    return (
      <div className="p-6">
        <EmptyState
          title="Armada tidak ditemukan"
          description="Armada yang Anda cari tidak ada atau telah dihapus."
          action={
            <Button variant="outline" onClick={() => navigate("/app/fleet")}>
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Daftar
            </Button>
          }
        />
      </div>
    );
  }

  const handleDeleteConfirm = async () => {
    await deleteMutation.mutateAsync(fleet.id);
    setDeleteDialogOpen(false);
    navigate("/app/fleet");
  };

  const handleRevokeConfirm = async () => {
    await revokeMutation.mutateAsync();
    setRevokeDialogOpen(false);
    refetch();
  };

  const handleEditSubmit = (values: UpdateFleetFormValues) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        setEditDialogOpen(false);
        refetch();
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="cursor-pointer" onClick={() => navigate("/app/fleet")}>
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        {canModify && (
          <div className="flex gap-2">
            <Button variant="outline" className="cursor-pointer" onClick={() => setEditDialogOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            {fleet.deviceRevokedAt === null && (
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => setRevokeDialogOpen(true)}
                disabled={revokeMutation.isPending}
              >
                <Ban className="h-4 w-4" />
                Cabut Perangkat
              </Button>
            )}
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Hapus
            </Button>
          </div>
        )}
      </div>

      <div className=" border border-border bg-background p-6">
        <h2 className="mb-4 text-xl font-bold text-foreground">{fleet.plateNumber}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Nama Sopir</p>
            <p className="text-base font-medium">{fleet.driverName ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Kontak</p>
            <p className="text-base font-medium">{fleet.driverContact ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Kapasitas</p>
            <p className="text-base font-medium">{fleet.capacityKg.toLocaleString("id-ID")} kg</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status Operasional</p>
            <StatusBadge status={fleet.operationalStatus} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status Hardware</p>
            <StatusBadge type="hardware" status={fleet.statusHardware} />
          </div>
          {fleet.deviceRevokedAt && (
            <div>
              <p className="text-sm text-muted-foreground">Perangkat Dicabut</p>
              <p className="text-base font-medium text-destructive">
                {new Date(fleet.deviceRevokedAt).toLocaleString("id-ID")}
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Edit Armada</DialogTitle>
          </DialogHeader>
          <FleetForm
            mode="edit"
            defaultValues={{
              driverName: fleet.driverName ?? "",
              driverContact: fleet.driverContact ?? "",
              capacityKg: fleet.capacityKg,
            }}
            fleet={fleet}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditDialogOpen(false)}
            isSubmitting={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={fleet.plateNumber}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      <RevokeDeviceDialog
        open={revokeDialogOpen}
        fleet={fleet}
        onConfirm={handleRevokeConfirm}
        onCancel={() => setRevokeDialogOpen(false)}
        isRevoking={revokeMutation.isPending}
      />
    </div>
  );
}