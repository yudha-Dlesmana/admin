import { z } from "zod";

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  single_session: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const RoleListSchema = z.object({
  items: z.array(RoleSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type Role = z.infer<typeof RoleSchema>;
export type RoleList = z.infer<typeof RoleListSchema>;
