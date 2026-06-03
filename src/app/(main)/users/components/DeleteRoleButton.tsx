"use client";

import { useState } from "react";
import { toast } from "sonner";
import { TrashIcon } from "@phosphor-icons/react";
import { deleteRole } from "@/lib/api/roles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  roleId: number;
  roleName: string;
  onDeleted: () => void;
};

export function DeleteRoleButton({ roleId, roleName, onDeleted }: Props) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    setDeleting(true);
    try {
      await deleteRole(roleId);
      toast.success("Role deleted");
      setOpen(false);
      onDeleted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete role");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !deleting && setOpen(next)}
    >
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-destructive hover:text-destructive"
          >
            <TrashIcon />
            Delete
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete role</DialogTitle>
          <DialogDescription>
            Delete{" "}
            <span className="font-mono text-foreground">{roleName}</span>? This
            action cannot be undone.
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
            onClick={confirm}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
