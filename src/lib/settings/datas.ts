import {
  Building2,
  Layers,
  ShieldCheck,
  Users,
  Repeat,
  History,
  type LucideIcon,
} from "lucide-react";

export const SETTINGS_BASE = "/admin/settings";

export const settingsNav: {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}[] = [
  {
    label: "Company profile",
    description: "Name, contact and logo",
    href: `${SETTINGS_BASE}/company`,
    icon: Building2,
  },
  {
    label: "Users",
    description: "Team members",
    href: `${SETTINGS_BASE}/users`,
    icon: Users,
  },
  {
    label: "Roles",
    description: "Access levels",
    href: `${SETTINGS_BASE}/roles`,
    icon: ShieldCheck,
  },
  {
    label: "Services",
    description: "Services and form fields",
    href: `${SETTINGS_BASE}/services`,
    icon: Layers,
  },
  {
    label: "Activity logs",
    description: "Who changed what, and when",
    href: `${SETTINGS_BASE}/logs`,
    icon: History,
  },
  {
    label: "System account",
    description: "Switch or add accounts",
    href: `${SETTINGS_BASE}/account`,
    icon: Repeat,
  },
];
