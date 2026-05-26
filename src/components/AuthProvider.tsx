"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { refresh, getCurrentUser } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  useEffect(() => {
    refresh()
      .then((ok) => (ok ? getCurrentUser() : null))
      .then(() => {
        const user = useAuthStore.getState().user;
        if (user && pathname === "/login") {
          const from = params.get("from") ?? "/";
          router.replace(from);
        }
      })
      .catch(() => useAuthStore.getState().clearAuth())
      .finally(() => setReady(true));
  }, [pathname, params, router]);

  if (!ready) return <div>Loading…</div>;
  return <>{children}</>;
}
