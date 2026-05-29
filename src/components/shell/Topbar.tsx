"use client";

import { useAuthStore } from "@/store/auth";
import { LogoutButton } from "@/components/LogoutButton";
import { SidebarTrigger } from "../ui/sidebar";

export function Topbar() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-20 h-14 shrink-0 border-b flex items-center justify-between px-4">
      <SidebarTrigger />
      <div className="flex items-center gap-4">
        {user && (
          <div className="text-right leading-tight">
            <div className="text-sm font-medium">{user.email}</div>
            <div className="text-xs text-muted-foreground">
              {user.role_name}
            </div>
          </div>
        )}
        <LogoutButton />
      </div>
    </header>
  );
}
