import { useAuthStore } from "@/store/auth";
import { API } from "@/lib/api/config";

const { setToken, clearAuth } = useAuthStore.getState();

async function refresh(): Promise<boolean> {
  const res = await fetch(`${API.IAM}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    clearAuth();
    return false;
  }
  const data = await res.json();
  setToken(data);
  return true;
}

function setHeaders(init: RequestInit) {
  const token = useAuthStore.getState().token;
  return {
    ...init,
    headers: {
      ...(token && {
        Authorization: `${token.tokenType} ${token.accessToken}`,
      }),
      ...init.headers,
    },
  };
}

export async function apiclient(url: string, init: RequestInit = {}) {
  let res = await fetch(url, setHeaders(init));
  if (res.status === 401) {
    const ok = await refresh();
    if (ok) res = await fetch(url, setHeaders(init));
  }
  return res;
}
