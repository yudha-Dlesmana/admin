"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { refresh, getCurrentUser } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    refresh()
      .then((ok) => (ok ? getCurrentUser() : null))
      .then(() => {
        const user = useAuthStore.getState().user;
        if (user && window.location.pathname === "/login") {
          const sp = new URLSearchParams(window.location.search);
          router.replace(sp.get("from") ?? "/");
        }
      })
      .catch(() => useAuthStore.getState().clearAuth())
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <div>Loading…</div>;
  return <>{children}</>;
}
