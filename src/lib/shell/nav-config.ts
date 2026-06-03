import { HouseIcon, UsersIcon, StackIcon } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

export type NavItem = {
  label: string;
  href: string;
  icon: Icon;
  permission?: string;
};

export const NAV: NavItem[] = [
  { label: "Dashboard", href: "/", icon: HouseIcon },
  {
    label: "Users & Roles",
    href: "/users",
    icon: UsersIcon,
    permission: "user.read",
  },
  {
    label: "Services & Permissions",
    href: "/services",
    icon: StackIcon,
    permission: "services.read",
  },
];
