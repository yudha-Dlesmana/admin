import { API } from "@/lib/config";
import { client } from "@/lib/client";
import { AuditLogListSchema } from "@/types/audit-log";

export type ListAuditLogsParams = {
  limit?: number;
  offset?: number;
};

export async function getAuditLogs({
  limit = 5,
  offset = 0,
}: ListAuditLogsParams = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const res = await client(`${API.IAM}/audit-logs?${params}`);
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return AuditLogListSchema.parse(await res.json());
}
