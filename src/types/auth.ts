import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.email(),
  role_name: z.string(),
  created_at: z.string().nullish(),
  updated_at: z.string().nullish(),
});

export const SessionSchema = z.object({
  device: z.string(),
  ip: z.string(),
  ua: z.string(),
  created_at: z.string(),
  last_seen: z.string(),
});

export const SessionsSchema = z.array(SessionSchema);

export const TokenSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("bearer"),
});

export type User = z.infer<typeof UserSchema>;
export type Token = z.infer<typeof TokenSchema>;
export type Session = z.infer<typeof SessionSchema>;
