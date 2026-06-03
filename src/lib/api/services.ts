import { API } from "@/lib/config";
import { client } from "@/lib/client";
import {
  ServiceListSchema,
  ServiceDetailSchema,
  ServiceSchema,
} from "@/types/service";
import type { CreateServiceInput } from "@/types/service";

export type ListServicesParams = {
  limit?: number;
  offset?: number;
  nameLike?: string;
};

export async function getServices({
  limit = 10,
  offset = 0,
  nameLike,
}: ListServicesParams = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (nameLike) params.set("name_like", nameLike);

  const res = await client(`${API.IAM}/services?${params}`);
  if (!res.ok) throw new Error("Failed to fetch services");
  return ServiceListSchema.parse(await res.json());
}

export async function createService(input: CreateServiceInput) {
  const res = await client(`${API.IAM}/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create service");
  return ServiceSchema.parse(await res.json());
}

export async function getService(id: number) {
  const res = await client(`${API.IAM}/services/${id}`);
  if (!res.ok) throw new Error("Failed to fetch service");
  return ServiceDetailSchema.parse(await res.json());
}

export async function deleteService(id: number) {
  const res = await client(`${API.IAM}/services/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete service");
}
