import { useAuthStore } from "@/store/auth";
import { API } from "@/lib/config";
import { TokenSchema } from "@/types/auth";

let refreshing: Promise<boolean> | null = null;
export function refresh() {
  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}
async function doRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API.IAM}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      await failAuth();
      return false;
    }
    const data = TokenSchema.parse(await res.json());
    useAuthStore.getState().setToken(data);
    return true;
  } catch {
    await failAuth();
    return false;
  }
}

// Refresh failed: drop in-memory auth, clear the refresh cookie server-side,
// and bounce to the login page.
async function failAuth() {
  useAuthStore.getState().clearAuth();
  try {
    await fetch(`${API.IAM}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {}
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

function setHeaders(init: RequestInit): RequestInit {
  const token = useAuthStore.getState().token;
  const headers = new Headers(init.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `${token.token_type} ${token.access_token}`);
  }
  return { ...init, headers };
}

export async function client(url: string, init: RequestInit = {}) {
  let res = await fetch(url, setHeaders(init));
  if (res.status === 401) {
    const ok = await refresh();
    if (ok) res = await fetch(url, setHeaders(init));
  }
  return res;
}
