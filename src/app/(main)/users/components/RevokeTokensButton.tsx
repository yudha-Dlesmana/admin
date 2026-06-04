"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SignOutIcon, WarningIcon } from "@phosphor-icons/react";
import { revokeUserTokens } from "@/lib/api/users";
import { logout } from "@/lib/api/auth";
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
  isSelf?: boolean;
  onRevoked: () => void;
};

export function RevokeTokensButton({
  userId,
  email,
  isSelf = false,
  onRevoked,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const confirm = async () => {
    setRevoking(true);
    try {
      await revokeUserTokens(userId);
      // Revoking your own tokens kills the current refresh token too, so sign
      // out cleanly and bounce to login instead of waiting for a 401.
      if (isSelf) {
        await logout();
        router.replace("/login");
        return;
      }
      toast.success("All tokens revoked");
      setOpen(false);
      onRevoked();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to revoke tokens",
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
            variant="outline"
            size="sm"
            className="h-7 px-2 text-destructive hover:text-destructive"
          >
            <SignOutIcon />
            Revoke all
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke all tokens</DialogTitle>
          <DialogDescription>
            Revoke every token for{" "}
            <span className="font-mono text-foreground">{email}</span>? All
            sessions across all devices will be signed out. This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        {isSelf && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
            <WarningIcon className="mt-0.5 size-4 shrink-0" />
            <span>
              This is your own account — you will be signed out and returned to
              the login page.
            </span>
          </div>
        )}
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
            {revoking ? "Revoking…" : "Revoke all"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
