import { z } from "zod";

export const AuditLogSchema = z.object({
  id: z.number(),
  actor_id: z.string(),
  action: z.string(),
  target_type: z.string().nullish(),
  target_id: z.string().nullish(),
  meta: z.record(z.string(), z.unknown()).nullish(),
  ip: z.string().nullish(),
  created_at: z.string(),
});

export const AuditLogListSchema = z.object({
  items: z.array(AuditLogSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;
export type AuditLogList = z.infer<typeof AuditLogListSchema>;
