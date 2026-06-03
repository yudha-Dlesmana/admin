"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PlusIcon } from "@phosphor-icons/react";
import { createRole } from "@/lib/api/roles";
import { createRoleSchema } from "@/types/role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  onCreated?: () => void;
};

export function AddRoleDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const reset = () => {
    setName("");
    setError(undefined);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);

    const result = createRoleSchema.safeParse({ name });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid name");
      return;
    }

    setLoading(true);
    try {
      await createRole(result.data);
      toast.success("Role created");
      reset();
      setOpen(false);
      onCreated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm">
            <PlusIcon />
            Add role
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add role</DialogTitle>
          <DialogDescription>Create a new role.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="add-role-name">Name</Label>
            <Input
              id="add-role-name"
              placeholder="e.g. administrator"
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!error}
              maxLength={100}
            />
            <p className="min-h-4 text-xs text-destructive">{error ?? ""}</p>
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
