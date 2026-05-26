"use client";
import { useEffect, useState } from "react";
import { refresh, getCurrentUser } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    refresh()
      .then((ok) => (ok ? getCurrentUser() : null))
      .catch(() => useAuthStore.getState().clearAuth())
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <div>Loading…</div>;
  return <>{children}</>;
}
