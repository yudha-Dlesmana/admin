import { API } from "@/lib/config";
import { client } from "@/lib/client";
import { RoleListSchema, RoleDetailSchema } from "@/types/role";

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

export async function getRole(id: number) {
  const res = await client(`${API.IAM}/roles/${id}`);
  if (!res.ok) throw new Error("Failed to fetch role");
  return RoleDetailSchema.parse(await res.json());
}
