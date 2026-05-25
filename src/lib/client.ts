import { useAuthStore } from "@/store/auth";
import { API } from "@/lib/config";

let refreshing: Promise<boolean> | null = null;
function refresh() {
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
      useAuthStore.getState().clearAuth();
      return false;
    }
    const data = await res.json();
    useAuthStore.getState().setToken({
      accessToken: data.access_token,
      tokenType: data.token_type,
    });
    return true;
  } catch {
    useAuthStore.getState().clearAuth();
    return false;
  }
}

function setHeaders(init: RequestInit): RequestInit {
  const token = useAuthStore.getState().token;
  const headers = new Headers(init.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `${token.tokenType} ${token.accessToken}`);
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
