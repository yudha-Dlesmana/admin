"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { updateUser } from "@/lib/api/users";
import { getRoles } from "@/lib/api/roles";
import type { Role } from "@/types/role";
import type { User } from "@/types/auth";
import { updateUserSchema } from "@/types/user";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FieldErrors = {
  email?: string;
  password?: string;
  role_id?: string;
};

type Props = {
  user: User;
  onUpdated?: () => void;
};

export function EditUserDialog({ user, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Load roles when the dialog opens and preselect the user's current role by
  // matching its name (the list only carries role_name, not role_id).
  useEffect(() => {
    if (!open) return;
    let active = true;
    setRolesLoading(true);
    getRoles({ limit: 100 })
      .then((res) => {
        if (!active) return;
        setRoles(res.items);
        const match = res.items.find((r) => r.name === user.role_name);
        if (match) setRoleId(match.id);
      })
      .catch(() => active && toast.error("Failed to load roles"))
      .finally(() => active && setRolesLoading(false));
    return () => {
      active = false;
    };
  }, [open, user.role_name]);

  const reset = () => {
    setEmail(user.email);
    setPassword("");
    setRoleId(null);
    setErrors({});
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const result = updateUserSchema.safeParse({
      email,
      password,
      role_id: roleId ?? undefined,
    });
    if (!result.success) {
      const fe: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (field && !fe[field]) fe[field] = issue.message;
      }
      setErrors(fe);
      return;
    }

    setLoading(true);
    try {
      await updateUser(user.id, result.data);
      toast.success("User updated");
      setOpen(false);
      onUpdated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user");
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
          <Button variant="outline" size="sm" className="h-7 px-2">
            <PencilSimpleIcon />
            Edit
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>
            Update the account details and role assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="user@example.com"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
            />
            <p className="min-h-4 text-xs text-destructive">
              {errors.email ?? ""}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-password">Password</Label>
            <Input
              id="edit-password"
              type="password"
              placeholder="Leave blank to keep current"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
            />
            <p className="min-h-4 text-xs text-destructive">
              {errors.password ?? ""}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            <Select
              value={roleId}
              onValueChange={(value) => setRoleId(value as number | null)}
            >
              <SelectTrigger
                className="w-full"
                aria-invalid={!!errors.role_id}
                disabled={rolesLoading}
              >
                <SelectValue
                  placeholder={rolesLoading ? "Loading roles…" : "Select a role"}
                >
                  {(value: number | null) =>
                    roles.find((r) => r.id === value)?.name
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="min-h-4 text-xs text-destructive">
              {errors.role_id ?? ""}
            </p>
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
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
