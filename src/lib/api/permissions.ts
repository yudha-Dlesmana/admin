import { API } from "@/lib/config";
import { client } from "@/lib/client";
import { PermissionListSchema, PermissionSchema } from "@/types/permission";
import type { CreatePermissionInput } from "@/types/permission";

export type ListPermissionsParams = {
  limit?: number;
  offset?: number;
  nameLike?: string;
};

export async function getPermissions({
  limit = 10,
  offset = 0,
  nameLike,
}: ListPermissionsParams = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (nameLike) params.set("name_like", nameLike);

  const res = await client(`${API.IAM}/permissions?${params}`);
  if (!res.ok) throw new Error("Failed to fetch permissions");
  return PermissionListSchema.parse(await res.json());
}

export async function createPermission(input: CreatePermissionInput) {
  const res = await client(`${API.IAM}/permissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create permission");
  return PermissionSchema.parse(await res.json());
}

export async function deletePermission(id: number) {
  const res = await client(`${API.IAM}/permissions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete permission");
}
