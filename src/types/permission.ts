import { z } from "zod";

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const PermissionListSchema = z.object({
  items: z.array(PermissionSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export const createPermissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  service_id: z.coerce
    .number({ message: "Service ID is required" })
    .int()
    .positive("Service ID must be positive"),
});

export type Permission = z.infer<typeof PermissionSchema>;
export type PermissionList = z.infer<typeof PermissionListSchema>;
export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
