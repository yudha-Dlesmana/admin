"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deletePermission } from "@/lib/api/permissions";
import type { Permission } from "@/types/permission";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  // The permission to delete; the dialog is open while non-null.
  permission: Permission | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: number) => void;
};

export function DeletePermissionDialog({
  permission,
  onOpenChange,
  onDeleted,
}: Props) {
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!permission) return;
    setDeleting(true);
    try {
      await deletePermission(permission.id);
      toast.success("Permission deleted");
      onDeleted(permission.id);
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete permission",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open={!!permission}
      onOpenChange={(next) => !next && !deleting && onOpenChange(false)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete permission</DialogTitle>
          <DialogDescription>
            Delete{" "}
            <span className="font-mono font-medium text-foreground">
              {permission?.name}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={deleting}>
                Cancel
              </Button>
            }
          />
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={confirmDelete}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
