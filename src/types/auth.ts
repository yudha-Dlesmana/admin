import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  email: z.email(),
  role_name: z.string(),
});

export const TokenSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("bearer"),
});

export type User = z.infer<typeof UserSchema>;
export type Token = z.infer<typeof TokenSchema>;
