import { API } from "@/lib/config";
import { client } from "@/lib/client";
import { useAuthStore } from "@/store/auth";
import { TokenSchema, UserSchema } from "@/types/auth";

export async function login(email: string, password: string) {
  const res = await client(`${API.IAM}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("login failed");
  const token = TokenSchema.parse(await res.json());
  useAuthStore.getState().setToken(token);
}

export async function getCurrentUser() {
  const res = await client(`${API.IAM}/auth/current-user`);
  if (!res.ok) throw new Error("Failed to fetch user");
  const user = UserSchema.parse(await res.json());
  useAuthStore.getState().setUser(user);
  return user;
}
export async function logout() {
  await client(`${API.IAM}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  useAuthStore.getState().clearAuth();
}
