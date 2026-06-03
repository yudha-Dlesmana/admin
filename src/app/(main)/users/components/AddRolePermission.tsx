"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  PlusIcon,
  KeyIcon,
  XIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { addRolePermissions } from "@/lib/api/roles";
import type { RoleDetail } from "@/types/role";
import type { Permission } from "@/types/permission";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  roleId: number;
  // IDs already assigned to the role; excluded from the picker.
  assignedIds: number[];
  // Permission catalogue, fetched once by the parent.
  perms: Permission[];
  permsLoading: boolean;
  // Called with the updated role detail returned by the API.
  onAdded: (detail: RoleDetail) => void;
};

export function AddRolePermission({
  roleId,
  assignedIds,
  perms,
  permsLoading,
  onAdded,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [staged, setStaged] = useState<Permission[]>([]);
  const [adding, setAdding] = useState(false);

  // Available = catalogue minus already-assigned minus already-staged.
  const available = useMemo(() => {
    const exclude = new Set([...assignedIds, ...staged.map((p) => p.id)]);
    return perms.filter((p) => !exclude.has(p.id));
  }, [perms, assignedIds, staged]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return available;
    return available.filter((p) => p.name.toLowerCase().includes(q));
  }, [available, search]);

  const close = () => {
    setOpen(false);
    setSearch("");
    setStaged([]);
  };

  const stage = (p: Permission) => {
    setStaged((cur) => [...cur, p]);
    setSearch("");
  };

  const unstage = (id: number) => {
    setStaged((cur) => cur.filter((p) => p.id !== id));
  };

  const add = async () => {
    if (staged.length === 0) return;
    setAdding(true);
    try {
      const detail = await addRolePermissions(
        roleId,
        staged.map((p) => p.id),
      );
      toast.success(
        staged.length === 1
          ? "Permission added"
          : `${staged.length} permissions added`,
      );
      close();
      onAdded(detail);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add permissions",
      );
    } finally {
      setAdding(false);
    }
  };

  // Collapsed: just the trigger.
  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="mt-1 h-8"
        disabled={permsLoading}
        onClick={() => setOpen(true)}
      >
        <PlusIcon />
        Add permission
      </Button>
    );
  }

  return (
    <div className="mt-1 space-y-2 border bg-background p-2">
      {/* Staged permissions, pending submit. */}
      {staged.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {staged.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1 border border-primary bg-primary/10 px-2 py-1 font-mono text-xs"
            >
              <KeyIcon className="size-3 text-primary" />
              {p.name}
              <button
                type="button"
                onClick={() => unstage(p.id)}
                disabled={adding}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${p.name}`}
              >
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search + pick. */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search permissions to add…"
          className="h-8 pl-8 text-xs"
          disabled={adding}
          maxLength={100}
          autoFocus
        />
      </div>

      <div className="max-h-40 divide-y overflow-y-auto border">
        {filtered.length === 0 ? (
          <div className="p-3 text-center text-xs text-muted-foreground">
            No matching permissions.
          </div>
        ) : (
          filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => stage(p)}
              disabled={adding}
              className="flex w-full items-center gap-2 px-2 py-1.5 text-left font-mono text-xs transition-colors hover:bg-muted/50"
            >
              <KeyIcon className="size-3 shrink-0 text-muted-foreground" />
              <span className="truncate">{p.name}</span>
            </button>
          ))
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          disabled={adding}
          onClick={close}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="h-8"
          disabled={staged.length === 0 || adding}
          onClick={add}
        >
          <PlusIcon />
          {adding
            ? "Adding…"
            : staged.length > 0
              ? `Add ${staged.length}`
              : "Add"}
        </Button>
      </div>
    </div>
  );
}
