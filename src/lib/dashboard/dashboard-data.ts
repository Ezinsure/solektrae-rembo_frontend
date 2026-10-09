// src/lib/dashboard-data.ts — statuses, helpers and SAMPLE data for the dashboard.
// TODO: replace sampleCustomers with GET /dashboard?from=&to= (the server computes the stats).

export const STATUSES = [
  { key: "pending", label: "Pending", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  { key: "in_progress", label: "In progress", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  { key: "completed", label: "Completed", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  { key: "cancelled", label: "Cancelled", dot: "bg-red-500", badge: "bg-red-50 text-red-700 ring-red-600/20" },
] as const;

export type StatusKey = (typeof STATUSES)[number]["key"];

export const SERVICES = [
  { key: "passport", label: "Passport" },
  { key: "laisserpasser", label: "Laissez-Passer" },
  { key: "foreignid", label: "Foreigner ID" },
  { key: "visa", label: "Visa" },
  { key: "permit", label: "Permit" },
  { key: "cpgl", label: "CEPGL" },
  { key: "penalty", label: "Penalty" },
  { key: "others", label: "Other services" },
];

export const STAFF = [
  { id: "u1", name: "Aline Uwase", email: "aline@example.com" },
  { id: "u2", name: "Eric Mugisha", email: "eric@example.com" },
  { id: "u3", name: "Diane Ingabire", email: "diane@example.com" },
  { id: "u4", name: "Patrick Habimana", email: "patrick@example.com" },
  { id: "u5", name: "Grace Uwimana", email: "grace@example.com" },
];

export type DashCustomer = {
  id: string;
  name: string;
  service: string;
  status: StatusKey;
  createdAt: string; // ISO
  createdById: string;
};

/* ── Dates (all in Kigali time, as YYYY-MM-DD strings) ── */
export const TZ = "Africa/Kigali";
export const dayKey = (d: Date | string) => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ });
export const addDays = (key: string, n: number) => {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
export const formatDay = (key: string, withYear = false) =>
  new Date(`${key}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC" });

/* ── Sample data (deterministic, so server and browser render the same) ── */
// Fixed "today" for the sample. With real data, use dayKey(new Date()).
export const SAMPLE_TODAY = "2026-10-09";

function seeded(seed: number) {
  return () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

const FIRST = ["Jean", "Grace", "Eric", "Alice", "Claude", "Diane", "Patrick", "Aline", "Olivier", "Sandrine", "Emmanuel", "Josiane"];
const LAST = ["Mugabo", "Uwimana", "Habimana", "Mukamana", "Niyonzima", "Ingabire", "Nshimiyimana", "Uwase", "Kayitesi", "Ndayisaba"];
const SERVICE_WEIGHTS = [30, 8, 10, 18, 12, 9, 6, 7];
const STATUS_WEIGHTS: [StatusKey, number][] = [["completed", 55], ["pending", 20], ["in_progress", 15], ["cancelled", 10]];

function pick<T>(r: () => number, items: T[], weights: number[]) {
  let x = r() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < items.length; i++) if ((x -= weights[i]) < 0) return items[i];
  return items[items.length - 1];
}

export const sampleCustomers: DashCustomer[] = (() => {
  const r = seeded(42);
  const list: DashCustomer[] = [];
  for (let i = 0; i < 640; i++) {
    const daysAgo = Math.floor(r() * 120);
    const day = addDays(SAMPLE_TODAY, -daysAgo);
    const status = pick(r, STATUS_WEIGHTS.map((s) => s[0]), STATUS_WEIGHTS.map((s) => s[1]));
    list.push({
      id: `c${1000 + i}`,
      name: `${FIRST[Math.floor(r() * FIRST.length)]} ${LAST[Math.floor(r() * LAST.length)]}`,
      service: pick(r, SERVICES.map((s) => s.key), SERVICE_WEIGHTS),
      // recent requests are more likely to still be open
      status: daysAgo < 5 && status === "completed" ? "pending" : status,
      createdAt: `${day}T${String(7 + Math.floor(r() * 10)).padStart(2, "0")}:15:00+02:00`,
      createdById: pick(r, STAFF.map((s) => s.id), [30, 25, 20, 10, 15]),
    });
  }
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
})();