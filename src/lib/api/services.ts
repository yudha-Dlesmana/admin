import { API } from "@/lib/config";
import { client } from "@/lib/client";
import { ServiceListSchema } from "@/types/service";

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
