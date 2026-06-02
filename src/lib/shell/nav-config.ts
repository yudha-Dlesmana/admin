import {
  HouseIcon,
  UsersIcon,
  ShieldCheckIcon,
  StackIcon,
} from "@phosphor-icons/react";
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
    label: "Users",
    href: "/users",
    icon: UsersIcon,
    permission: "user.read",
  },
  {
    label: "Roles - Permissions",
    href: "/roles-permissions",
    icon: ShieldCheckIcon,
    permission: "role.read",
  },
  {
    label: "Services",
    href: "/services",
    icon: StackIcon,
    permission: "services.read",
  },
];
