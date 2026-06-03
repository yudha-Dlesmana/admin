import { API } from "@/lib/config";
import { client } from "@/lib/client";
import { RoleListSchema, RoleDetailSchema, RoleSchema } from "@/types/role";
import type { CreateRoleInput } from "@/types/role";

export type ListRolesParams = {
  limit?: number;
  offset?: number;
  nameLike?: string;
};

export async function getRoles({
  limit = 10,
  offset = 0,
  nameLike,
}: ListRolesParams = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (nameLike) params.set("name_like", nameLike);

  const res = await client(`${API.IAM}/roles?${params}`);
  if (!res.ok) throw new Error("Failed to fetch roles");
  return RoleListSchema.parse(await res.json());
}

export async function createRole(input: CreateRoleInput) {
  const res = await client(`${API.IAM}/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create role");
  return RoleSchema.parse(await res.json());
}

export async function updateRole(id: number, input: CreateRoleInput) {
  const res = await client(`${API.IAM}/roles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update role");
  return RoleSchema.parse(await res.json());
}

export async function getRole(id: number) {
  const res = await client(`${API.IAM}/roles/${id}`);
  if (!res.ok) throw new Error("Failed to fetch role");
  return RoleDetailSchema.parse(await res.json());
}

export async function deleteRole(id: number) {
  const res = await client(`${API.IAM}/roles/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete role");
}

export async function addRolePermissions(id: number, permissionIds: number[]) {
  const res = await client(`${API.IAM}/roles/${id}/permissions?mode=add`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ permission_ids: permissionIds }),
  });
  if (!res.ok) throw new Error("Failed to add permissions");
  return RoleDetailSchema.parse(await res.json());
}

export async function removeRolePermission(id: number, permissionId: number) {
  const res = await client(
    `${API.IAM}/roles/${id}/permissions/${permissionId}`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error("Failed to remove permission");
  return RoleDetailSchema.parse(await res.json());
}
