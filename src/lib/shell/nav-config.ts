import {
  HouseIcon,
  UsersIcon,
  ShieldCheckIcon,
  KeyIcon,
  IdentificationCardIcon,
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
    label: "Roles",
    href: "/roles",
    icon: ShieldCheckIcon,
    permission: "role.read",
  },
  {
    label: "Permissions",
    href: "/permissions",
    icon: KeyIcon,
    permission: "permission.read",
  },
  {
    label: "Sessions",
    href: "/sessions",
    icon: IdentificationCardIcon,
    permission: "session.read",
  },
];
