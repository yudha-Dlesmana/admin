"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusIcon } from "@phosphor-icons/react";
import { createPermission } from "@/lib/api/permissions";
import { createPermissionSchema } from "@/types/permission";
import { getServices } from "@/lib/api/services";
import type { Service } from "@/types/service";
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
  name?: string;
  service_id?: string;
};

type Props = {
  onCreated?: () => void;
};

export function AddPermissionDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Load services for the picker when the dialog opens.
  useEffect(() => {
    if (!open) return;
    let active = true;
    setServicesLoading(true);
    getServices({ limit: 100 })
      .then((res) => active && setServices(res.items))
      .catch(() => active && toast.error("Failed to load services"))
      .finally(() => active && setServicesLoading(false));
    return () => {
      active = false;
    };
  }, [open]);

  const reset = () => {
    setName("");
    setServiceId(null);
    setErrors({});
  };

  // Selecting a service prefixes the name with "<service>." (swapping any
  // previously applied service prefix).
  const handleServiceChange = (value: number | null) => {
    const prev = services.find((s) => s.id === serviceId)?.name;
    const next = services.find((s) => s.id === value)?.name;
    setServiceId(value);
    setName((cur) => {
      let rest = cur;
      if (prev && rest.startsWith(`${prev}.`))
        rest = rest.slice(prev.length + 1);
      return next ? `${next}.${rest}` : rest;
    });
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const result = createPermissionSchema.safeParse({
      name,
      service_id: serviceId ?? undefined,
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
      await createPermission(result.data);
      toast.success("Permission created");
      reset();
      setOpen(false);
      onCreated?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create permission",
      );
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
            Add
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add permission</DialogTitle>
          <DialogDescription>
            Create a new permission for a service.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col">
          <div className="flex flex-col gap-1.5">
            <Label>Service</Label>
            <Select
              value={serviceId}
              onValueChange={(value) =>
                handleServiceChange(value as number | null)
              }
            >
              <SelectTrigger
                className="w-full"
                aria-invalid={!!errors.service_id}
                disabled={servicesLoading}
              >
                <SelectValue
                  placeholder={
                    servicesLoading ? "Loading services…" : "Select a service"
                  }
                >
                  {(value: number | null) =>
                    services.find((s) => s.id === value)?.name
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="min-h-4 text-xs text-destructive">
              {errors.service_id ?? ""}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="add-perm-name">Name</Label>
            <Input
              id="add-perm-name"
              placeholder="service.resource.action"
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
            />
            <p className="min-h-4 text-xs text-destructive">
              {errors.name ?? ""}
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
              {loading ? "Creating..." : "Create permission"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
