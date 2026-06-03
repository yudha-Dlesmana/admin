"use client";

import { useState } from "react";
import { toast } from "sonner";
import { KeyIcon, XIcon } from "@phosphor-icons/react";
import { removeRolePermission } from "@/lib/api/roles";
import type { RoleDetail } from "@/types/role";
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
  roleId: number;
  permissions: Permission[];
  // Called with the updated role detail returned by the API.
  onChanged: (detail: RoleDetail) => void;
};

export function RolePermissionChips({ roleId, permissions, onChanged }: Props) {
  const [pending, setPending] = useState<Permission | null>(null);
  const [removing, setRemoving] = useState(false);

  const confirmRemove = async () => {
    if (!pending) return;
    setRemoving(true);
    try {
      const detail = await removeRolePermission(roleId, pending.id);
      toast.success("Permission removed");
      setPending(null);
      onChanged(detail);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove permission",
      );
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {permissions.map((p) => (
          <span
            key={p.id}
            className="inline-flex items-center gap-1 border bg-background px-2 py-1 font-mono text-xs"
          >
            <KeyIcon className="size-3 text-muted-foreground" />
            {p.name}
            <button
              type="button"
              onClick={() => setPending(p)}
              className="ml-0.5 text-muted-foreground transition-colors hover:text-destructive"
              aria-label={`Remove ${p.name}`}
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
      </div>

      <Dialog
        open={pending !== null}
        onOpenChange={(next) => !next && !removing && setPending(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove permission</DialogTitle>
            <DialogDescription>
              Remove{" "}
              <span className="font-mono text-foreground">{pending?.name}</span>{" "}
              from this role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={removing}>
                  Cancel
                </Button>
              }
            />
            <Button
              type="button"
              variant="destructive"
              disabled={removing}
              onClick={confirmRemove}
            >
              {removing ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
