"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SignOutIcon } from "@phosphor-icons/react";
import { revokeUserSession } from "@/lib/api/users";
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
  device: string;
  ip?: string;
  onRevoked: () => void;
};

export function RevokeSessionButton({ userId, device, ip, onRevoked }: Props) {
  const [open, setOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const confirm = async () => {
    setRevoking(true);
    try {
      await revokeUserSession(userId, device);
      toast.success("Session revoked");
      setOpen(false);
      onRevoked();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to revoke session",
      );
    } finally {
      setRevoking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !revoking && setOpen(next)}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-destructive hover:text-destructive"
          >
            <SignOutIcon />
            Revoke
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke session</DialogTitle>
          <DialogDescription>
            Revoke the session from{" "}
            <span className="font-mono text-foreground">
              {ip || "this device"}
            </span>
            ? The device will be signed out. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={revoking}>
                Cancel
              </Button>
            }
          />
          <Button
            type="button"
            variant="destructive"
            disabled={revoking}
            onClick={confirm}
          >
            {revoking ? "Revoking…" : "Revoke"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
