import { z } from "zod";
import { UserSchema } from "@/types/auth";

export const UserListSchema = z.object({
  items: z.array(UserSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export const createUserSchema = z.object({
  email: z.email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
  role_id: z.coerce
    .number("Role is required")
    .int("Role must be an integer")
    .positive("Role must be a positive number"),
});

export const updateUserSchema = z.object({
  email: z.email("Invalid email"),
  // Optional — leave blank to keep the current password.
  password: z
    .union([
      z.literal(""),
      z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password is too long"),
    ])
    .optional(),
  role_id: z.coerce
    .number("Role is required")
    .int("Role must be an integer")
    .positive("Role must be a positive number"),
});

export type UserList = z.infer<typeof UserListSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
