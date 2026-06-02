"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PlusIcon } from "@phosphor-icons/react";
import { createUser } from "@/lib/api/users";
import { createUserSchema } from "@/types/user";
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

type FieldErrors = {
  email?: string;
  password?: string;
  role_id?: string;
};

type Props = {
  onCreated?: () => void;
};

export function AddUserDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const reset = () => {
    setEmail("");
    setPassword("");
    setRoleId("");
    setErrors({});
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const result = createUserSchema.safeParse({
      email,
      password,
      role_id: roleId,
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
      await createUser(result.data);
      toast.success("User created");
      reset();
      setOpen(false);
      onCreated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
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
            Add user
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>
            Create a new user account and assign a role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="add-email">Email</Label>
            <Input
              id="add-email"
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
            <Label htmlFor="add-password">Password</Label>
            <Input
              id="add-password"
              type="password"
              placeholder="••••••••"
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
            <Label htmlFor="add-role-id">Role ID</Label>
            <Input
              id="add-role-id"
              type="number"
              min={1}
              placeholder="1"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              aria-invalid={!!errors.role_id}
            />
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
              {loading ? "Creating..." : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
