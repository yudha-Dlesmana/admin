"use client";

import { useState } from "react";
import { toast } from "sonner";
import { TrashIcon } from "@phosphor-icons/react";
import { deleteUser } from "@/lib/api/users";
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
  userId: string;
  email: string;
  onDeleted: () => void;
};

export function DeleteUserButton({ userId, email, onDeleted }: Props) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    setDeleting(true);
    try {
      await deleteUser(userId);
      toast.success("User deleted");
      setOpen(false);
      onDeleted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !deleting && setOpen(next)}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-destructive hover:text-destructive"
          >
            <TrashIcon />
            Delete
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete user</DialogTitle>
          <DialogDescription>
            Delete{" "}
            <span className="font-mono text-foreground">{email}</span>? This
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
