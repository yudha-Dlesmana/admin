import { z } from "zod";
import { PermissionSchema } from "@/types/permission";

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  single_session: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const RoleDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  single_session: z.boolean(),
  permissions: z.array(PermissionSchema).default([]),
});

export const RoleListSchema = z.object({
  items: z.array(RoleSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export const createRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
});

export type Role = z.infer<typeof RoleSchema>;
export type RoleList = z.infer<typeof RoleListSchema>;
export type RoleDetail = z.infer<typeof RoleDetailSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
