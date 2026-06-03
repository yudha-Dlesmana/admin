import { API } from "@/lib/config";
import { client } from "@/lib/client";
import { UserSchema, SessionsSchema } from "@/types/auth";
import { UserListSchema, type CreateUserInput } from "@/types/user";

export type ListUsersParams = {
  limit?: number;
  offset?: number;
  emailLike?: string;
};

export async function getUsers({
  limit = 10,
  offset = 0,
  emailLike,
}: ListUsersParams = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (emailLike) params.set("email_like", emailLike);

  const res = await client(`${API.IAM}/users?${params}`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return UserListSchema.parse(await res.json());
}

export async function createUser(input: CreateUserInput) {
  const res = await client(`${API.IAM}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    let message = "Failed to create user";
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") message = data.detail;
    } catch {}
    throw new Error(message);
  }
  return UserSchema.parse(await res.json());
}

export async function getUserSessions(id: string) {
  const res = await client(`${API.IAM}/users/${id}/sessions`);
  if (!res.ok) throw new Error("Failed to fetch user sessions");
  return SessionsSchema.parse(await res.json());
}
