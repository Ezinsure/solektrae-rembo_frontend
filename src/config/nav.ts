export const ROLES = ["admin", "dev", "staff", "hr"];

export const ROLE_OPTIONS = ROLES.map((r) => ({
  value: r,
  label: r.charAt(0).toUpperCase() + r.slice(1),
}));

const FULL_ACCESS_ROLES = ["admin", "dev"];

export interface NavLink {
  href: string;
  label: string;
  roles?: string[];
}

export const NAV_LINKS: NavLink[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Customers", href: "/admin/customers", roles: ["staff"] },
  { label: "Settings", href: "/admin/settings", roles: ["hr"] },
];

// exact match or a real sub-route
const matchesPath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export const canSeeLink = (link: NavLink, role?: string) => {
  if (!role) return false;
  if (FULL_ACCESS_ROLES.includes(role)) return true;
  if (!link.roles) return true;
  return link.roles.includes(role);
};

// first page this role is allowed to open, used as the redirect target
export const getDefaultRoute = (role?: string) =>
  NAV_LINKS.find((l) => canSeeLink(l, role))?.href;

export const canAccess = (role: string | undefined, pathname: string) => {
  if (!role) return false;
  if (FULL_ACCESS_ROLES.includes(role)) return true;

  const match = NAV_LINKS.find((l) => matchesPath(pathname, l.href));
  if (!match) return false; // not listed = not allowed (was: true)

  return canSeeLink(match, role);
};
