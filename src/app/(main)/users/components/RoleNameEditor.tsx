"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PencilSimpleIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import { updateRole } from "@/lib/api/roles";
import { createRoleSchema } from "@/types/role";
import type { Role } from "@/types/role";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  roleId: number;
  currentName: string;
  // Called with the updated role returned by the API.
  onRenamed: (role: Role) => void;
};

export function RoleNameEditor({ roleId, currentName, onRenamed }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const start = () => {
    setName(currentName);
    setError(undefined);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setError(undefined);
  };

  const save = async () => {
    setError(undefined);
    const result = createRoleSchema.safeParse({ name });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid name");
      return;
    }
    if (result.data.name === currentName) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      const role = await updateRole(roleId, result.data);
      toast.success("Role renamed");
      setEditing(false);
      onRenamed(role);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to rename role");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <Button variant="outline" size="sm" className="h-8" onClick={start}>
        <PencilSimpleIcon />
        Rename
      </Button>
    );
  }

  return (
    <div className="flex items-start gap-1.5">
      <div className="flex flex-col">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              save();
            } else if (e.key === "Escape") {
              cancel();
            }
          }}
          aria-invalid={!!error}
          disabled={saving}
          maxLength={100}
          autoFocus
          className="h-8 w-48 text-xs"
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
      <Button
        size="sm"
        className="h-8"
        onClick={save}
        disabled={saving}
        aria-label="Save"
      >
        <CheckIcon />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8"
        onClick={cancel}
        disabled={saving}
        aria-label="Cancel"
      >
        <XIcon />
      </Button>
    </div>
  );
}
