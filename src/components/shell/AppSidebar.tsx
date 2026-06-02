"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FingerprintIcon, UserCircleIcon } from "@phosphor-icons/react";
import { NAV } from "@/lib/shell/nav-config";
import { useAuthStore } from "@/store/auth";
import { LogoutButton } from "@/components/LogoutButton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-16 shrink-0 items-center justify-center text-foreground">
            <FingerprintIcon weight="bold" className="size-8" />
          </div>
          <span className="font-semibold text-xl tracking-tight group-data-[collapsible=icon]:hidden">
            IAM Admin
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(({ label, href, icon: Icon }) => {
                const active =
                  href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={label}
                      render={<Link href={href} />}
                    >
                      <Icon weight={active ? "fill" : "regular"} />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <UserCircleIcon className="size-7 shrink-0 text-muted-foreground" />
          {user && (
            <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
              <div className="truncate text-sm font-medium" title={user.email}>
                {user.email}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {user.role_name}
              </div>
            </div>
          )}
        </div>
        <div className="group-data-[collapsible=icon]:hidden">
          <LogoutButton className="w-full" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
