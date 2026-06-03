import { z } from "zod";
import { PermissionSchema } from "@/types/permission";

export const ServiceSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.string().nullish(),
  updated_at: z.string().nullish(),
});

export const ServiceListSchema = z.object({
  items: z.array(ServiceSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export const ServiceDetailSchema = ServiceSchema.extend({
  permissions: z.array(PermissionSchema).default([]),
});

export const createServiceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
});

export type Service = z.infer<typeof ServiceSchema>;
export type ServiceList = z.infer<typeof ServiceListSchema>;
export type ServiceDetail = z.infer<typeof ServiceDetailSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
