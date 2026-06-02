import { z } from "zod";

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

export type Service = z.infer<typeof ServiceSchema>;
export type ServiceList = z.infer<typeof ServiceListSchema>;
