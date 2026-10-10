// src/lib/settings-data.ts — settings navigation, form-field catalog and sample data.
// TODO: replace the sample data with API data later.
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
    label: "Roles",
    description: "Access levels",
    href: `${SETTINGS_BASE}/roles`,
    icon: ShieldCheck,
  },
  {
    label: "Users",
    description: "Team members",
    href: `${SETTINGS_BASE}/users`,
    icon: Users,
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

/* ── Form fields that a service can ask for (step 2 of the customer form) ── */
export type FieldKey =
  | "fatherName"
  | "motherName"
  | "spouseName"
  | "height"
  | "hovName"
  | "hovNumber"
  | "district"
  | "sector"
  | "cell"
  | "village"
  | "street";

// TODO: reuse the labels from FIELD_META in lib/form-schema
export const FIELD_GROUPS: {
  group: string;
  fields: { key: FieldKey; label: string }[];
}[] = [
  {
    group: "Family",
    fields: [
      { key: "fatherName", label: "Father's name" },
      { key: "motherName", label: "Mother's name" },
      { key: "spouseName", label: "Spouse's name" },
    ],
  },
  {
    group: "Personal",
    fields: [
      { key: "height", label: "Height (cm)" },
      { key: "hovName", label: "HOV name" },
      { key: "hovNumber", label: "HOV number" },
    ],
  },
  {
    group: "Address",
    fields: [
      { key: "district", label: "District" },
      { key: "sector", label: "Sector" },
      { key: "cell", label: "Cell" },
      { key: "village", label: "Village" },
      { key: "street", label: "Street" },
    ],
  },
];

export const fieldLabel = (key: FieldKey) =>
  FIELD_GROUPS.flatMap((g) => g.fields).find((f) => f.key === key)?.label ??
  key;

/* ── Services ────────────────────────────────────────────── */
export type ServiceField = { key: FieldKey; required: boolean };

export type Service = {
  id: string;
  key: string; // stable code saved on each customer, e.g. "passport"
  name: string;
  description: string;
  tags: string[];
  active: boolean; // inactive = hidden from the customer form
  allowCustomName: boolean; // "Other services": customer types the service name
  fields: ServiceField[];
};

const req = (...keys: FieldKey[]): ServiceField[] =>
  keys.map((key) => ({ key, required: true }));
const ADDRESS: FieldKey[] = ["district", "sector", "cell", "village"];

export const sampleServices: Service[] = [
  {
    id: "s1",
    key: "passport",
    name: "Passport",
    description: "New passport and renewals.",
    tags: ["Travel"],
    active: true,
    allowCustomName: false,
    fields: req("height", "hovName", "hovNumber", ...ADDRESS),
  },
  {
    id: "s2",
    key: "laisserpasser",
    name: "Laissez-Passer",
    description: "Travel document for the region.",
    tags: ["Travel"],
    active: true,
    allowCustomName: false,
    fields: req("height", "hovName", "hovNumber", ...ADDRESS),
  },
  {
    id: "s3",
    key: "foreignid",
    name: "Foreigner ID",
    description: "ID card for foreign residents.",
    tags: ["Identity"],
    active: true,
    allowCustomName: false,
    fields: req("height", "hovName", "hovNumber"),
  },
  {
    id: "s4",
    key: "visa",
    name: "Visa",
    description: "Visa applications.",
    tags: ["Immigration"],
    active: true,
    allowCustomName: false,
    fields: [
      ...req("fatherName", "motherName"),
      { key: "spouseName", required: false },
      ...req(...ADDRESS, "street"),
    ],
  },
  {
    id: "s5",
    key: "permit",
    name: "Permit",
    description: "Residence and work permits.",
    tags: ["Immigration"],
    active: true,
    allowCustomName: false,
    fields: [
      ...req("fatherName", "motherName"),
      { key: "spouseName", required: false },
      ...req(...ADDRESS, "street"),
    ],
  },
  {
    id: "s6",
    key: "cpgl",
    name: "CEPGL",
    description: "CEPGL travel document.",
    tags: ["Travel"],
    active: true,
    allowCustomName: false,
    fields: req("fatherName", "motherName", "hovName", "hovNumber", ...ADDRESS),
  },
  {
    id: "s7",
    key: "penalty",
    name: "Penalty",
    description: "Paying immigration penalties.",
    tags: ["Payments"],
    active: true,
    allowCustomName: false,
    fields: req("height", "hovNumber", "hovName"),
  },
  {
    id: "s8",
    key: "others",
    name: "Other services",
    description: "Any service not listed above.",
    tags: [],
    active: true,
    allowCustomName: true,
    fields: [
      ...req("fatherName", "motherName"),
      { key: "spouseName", required: false },
      ...req(...ADDRESS, "street"),
    ],
  },
];

/* ── System accounts (companies using the system) ────────── */
export type SystemAccount = {
  id: string;
  name: string;
  logo: string | null;
  role: string;
  members: number;
};

export const sampleAccounts: SystemAccount[] = [
  { id: "a1", name: "Solektra Rembo", logo: null, role: "Admin", members: 9 },
  {
    id: "a2",
    name: "Kigali Services Ltd",
    logo: null,
    role: "Agent",
    members: 4,
  },
];

/* ── Activity logs (read-only audit trail) ───────────────── */
export type LogAction =
  | "create"
  | "update"
  | "delete"
  | "restore"
  | "login"
  | "logout"
  | "login_failed"
  | "password_reset";
export type LogEntity =
  | "customer"
  | "user"
  | "role"
  | "service"
  | "company"
  | "auth";

export type LogEntry = {
  id: string;
  createdAt: string;
  actor: { id: string; name: string } | null; // null = system or unknown (e.g. failed login)
  action: LogAction;
  entity: LogEntity;
  entityId: string | null;
  summary: string;
  ip: string | null;
  userAgent: string | null;
  changes?: { field: string; from: string | null; to: string | null }[];
};

export const sampleLogs: LogEntry[] = [
  {
    id: "l1",
    createdAt: "2026-10-09T09:12:00Z",
    actor: { id: "u1", name: "Aline Uwase" },
    action: "update",
    entity: "customer",
    entityId: "c-1042",
    summary: "Updated customer Jean Mugabo",
    ip: "41.186.22.10",
    userAgent: "Chrome on Windows",
    changes: [
      { field: "Phone", from: "+250 788 111 222", to: "+250 788 111 333" },
      { field: "Service", from: "Passport", to: "Visa" },
    ],
  },
  {
    id: "l2",
    createdAt: "2026-10-09T08:47:00Z",
    actor: { id: "u2", name: "Eric Mugisha" },
    action: "create",
    entity: "customer",
    entityId: "c-1043",
    summary: "Registered customer Grace Uwimana",
    ip: "41.186.22.14",
    userAgent: "Safari on iPhone",
  },
  {
    id: "l3",
    createdAt: "2026-10-09T08:30:00Z",
    actor: null,
    action: "login_failed",
    entity: "auth",
    entityId: null,
    summary: "Failed login for diane@example.com",
    ip: "102.22.140.5",
    userAgent: "Firefox on Linux",
  },
  {
    id: "l4",
    createdAt: "2026-10-09T07:58:00Z",
    actor: { id: "u1", name: "Aline Uwase" },
    action: "login",
    entity: "auth",
    entityId: null,
    summary: "Signed in",
    ip: "41.186.22.10",
    userAgent: "Chrome on Windows",
  },
  {
    id: "l5",
    createdAt: "2026-10-08T16:20:00Z",
    actor: { id: "u1", name: "Aline Uwase" },
    action: "update",
    entity: "service",
    entityId: "s4",
    summary: "Changed fields for Visa",
    ip: "41.186.22.10",
    userAgent: "Chrome on Windows",
    changes: [{ field: "Spouse's name", from: "Required", to: "Optional" }],
  },
  {
    id: "l6",
    createdAt: "2026-10-08T14:05:00Z",
    actor: { id: "u1", name: "Aline Uwase" },
    action: "delete",
    entity: "user",
    entityId: "u4",
    summary: "Deleted user Patrick Habimana",
    ip: "41.186.22.10",
    userAgent: "Chrome on Windows",
  },
  {
    id: "l7",
    createdAt: "2026-10-08T11:40:00Z",
    actor: { id: "u1", name: "Aline Uwase" },
    action: "password_reset",
    entity: "user",
    entityId: "u3",
    summary: "Reset password for Diane Ingabire",
    ip: "41.186.22.10",
    userAgent: "Chrome on Windows",
  },
  {
    id: "l8",
    createdAt: "2026-10-07T10:15:00Z",
    actor: { id: "u2", name: "Eric Mugisha" },
    action: "restore",
    entity: "customer",
    entityId: "c-0988",
    summary: "Restored customer Alice Mukamana",
    ip: "41.186.22.14",
    userAgent: "Safari on iPhone",
  },
  {
    id: "l9",
    createdAt: "2026-10-07T09:02:00Z",
    actor: { id: "u1", name: "Aline Uwase" },
    action: "update",
    entity: "company",
    entityId: null,
    summary: "Updated company profile",
    ip: "41.186.22.10",
    userAgent: "Chrome on Windows",
    changes: [
      { field: "Email", from: "old@example.com", to: "info@example.com" },
    ],
  },
  {
    id: "l10",
    createdAt: "2026-10-06T15:30:00Z",
    actor: { id: "u1", name: "Aline Uwase" },
    action: "create",
    entity: "role",
    entityId: "r3",
    summary: "Created role Viewer",
    ip: "41.186.22.10",
    userAgent: "Chrome on Windows",
  },
];
