import { API } from "@/lib/config";
import { client } from "@/lib/client";
import { useAuthStore } from "@/store/auth";
import { SessionSchema, SessionsSchema, TokenSchema, UserSchema } from "@/types/auth";

export { refresh } from "@/lib/client";

export async function login(email: string, password: string) {
  const res = await fetch(`${API.IAM}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("login failed");
  const token = TokenSchema.parse(await res.json());
  useAuthStore.getState().setToken(token);
  try {
    await getCurrentUser();
  } catch (e) {
    useAuthStore.getState().clearAuth();
    throw e;
  }
}

export async function logout() {
  await fetch(`${API.IAM}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  useAuthStore.getState().clearAuth();
}

export async function getCurrentUser() {
  const res = await client(`${API.IAM}/auth/current-user`);
  if (!res.ok) throw new Error("Failed to fetch user");
  const user = UserSchema.parse(await res.json());
  useAuthStore.getState().setUser(user);
  return user;
}

export async function getSessions() {
  const res = await client(`${API.IAM}/auth/sessions`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return SessionsSchema.parse(await res.json());
}

export async function getCurrentSession() {
  const res = await client(`${API.IAM}/auth/sessions/current`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch current session");
  return SessionSchema.parse(await res.json());
}
