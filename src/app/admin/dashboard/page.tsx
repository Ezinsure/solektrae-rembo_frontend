"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock, Eye, Loader2, Users, XCircle } from "lucide-react";
import Modal from "@/components/modal/settingModal";
import { STATUSES, addDays, dayKey, daysBetween, formatDay } from "@/lib/dashboard/dashboard-data";
import { cn } from "@/lib/utils";
import TrendChart, { buildTrend } from "@/components/dashboard/TrendChart";
import { useDashboard } from "@/hooks/useDash";
import { useGetAllCustomers } from "@/hooks/useCustomer";

const PRESETS = [
  { label: "7 days", days: 6 },
  { label: "30 days", days: 29 },
  { label: "90 days", days: 89 },
] as const;

// The statuses the system uses now
const STATUS_LIST: any[] = STATUSES.filter((s: any) => ["pending", "completed", "cancelled"].includes(s.key));
// Statuses a staff member sets (pending is nobody's)
const HANDLED_STATUSES: any[] = STATUS_LIST.filter((s: any) => s.key !== "pending");

const STATUS_ICON: any = { pending: Clock, completed: CheckCircle2, cancelled: XCircle };

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

const EMPTY = {
  total: 0,
  previousTotal: 0,
  statusCounts: { pending: 0, completed: 0, cancelled: 0 } as any,
  services: [] as any[],
  trend: [] as any[],
  staff: [] as any[],
};

export default function DashboardPage() {
  const today = dayKey(new Date());
  const [from, setFrom] = useState(addDays(today, -29));
  const [to, setTo] = useState(today);
  const [viewing, setViewing] = useState<string | null>(null);

  const days = Math.max(0, daysBetween(from, to));
  const activePreset = to === today ? PRESETS.find((p) => p.days === days)?.label : undefined;

  const { data: api, isLoading, isFetching, isError } = useDashboard({ from, to });
  const data = api ?? EMPTY;

  // TrendChart builds its points from one day key per customer
  const trend = useMemo(
    () => buildTrend(data.trend?.flatMap((t: any) => Array(t.count).fill(t.day)), from, to, days),
    [data.trend, from, to, days],
  );

  const change = data.previousTotal
    ? Math.round(((data.total - data.previousTotal) / data.previousTotal) * 100)
    : null;
  const viewingStaff = data?.staff?.find((s: any) => s.id === viewing) ?? null;

  return (
    <div className={cn(isFetching && !isLoading && "opacity-70 transition-opacity")}>
      {/* Header + date range */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="mb-5">
          <h1 className="flex items-center gap-2 text-2xl font-medium">
            Dashboard {isFetching && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </h1>
          <p className="text-muted-foreground">
            {formatDay(from, true)} – {formatDay(to, true)} · {days + 1} days
          </p>
        </div>

        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5" role="group" aria-label="Date range">
            {PRESETS?.map((p) => (
              <button
                key={p.label}
                type="button"
                aria-pressed={activePreset === p.label}
                onClick={() => { setTo(today); setFrom(addDays(today, -p.days)); }}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  activePreset === p.label ? "bg-primary text-primary-foreground" : "text-gray-600 hover:bg-gray-100",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1">
            <CalendarDays className="h-4 w-4 shrink-0 text-gray-400" />
            <input type="date" aria-label="From" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} className="bg-transparent text-sm outline-none" />
            <span className="text-gray-400">–</span>
            <input type="date" aria-label="To" value={to} min={from} max={today} onChange={(e) => e.target.value && setTo(e.target.value)} className="bg-transparent text-sm outline-none" />
          </div>
        </div>
      </div>

      {isError && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load the dashboard. Please refresh the page.
        </p>
      )}

      {/* Summary tiles */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500"><Users className="h-4 w-4" /> Total customers</div>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{isLoading ? "—" : data?.total?.toLocaleString()}</p>
          {change !== null && (
            <p className="mt-1 text-xs text-gray-500">
              <span className={cn("font-medium", change >= 0 ? "text-emerald-700" : "text-red-700")}>
                {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
              </span>{" "}
              vs previous {days + 1} days
            </p>
          )}
        </div>
        {STATUS_LIST?.map((s: any) => {
          const Icon = STATUS_ICON[s.key];
          const n = data.statusCounts[s.key] ?? 0;
          return (
            <div key={s.key} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm text-gray-500"><Icon className="h-4 w-4" /> {s.label}</div>
              <p className="mt-3 text-3xl font-semibold text-gray-900">{isLoading ? "—" : n.toLocaleString()}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div className={cn("h-full rounded-full", s.dot)} style={{ width: `${pct(n, data.total)}%` }} />
                </div>
                <span className="text-xs text-gray-500">{pct(n, data.total)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mb-4 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6" aria-labelledby="trend-title">
          <h2 id="trend-title" className="text-base font-semibold text-gray-900">New customers</h2>
          <p className="text-sm text-gray-500">{days > 45 ? "Per week" : "Per day"}, for the selected dates</p>
          <div className="mt-4">
            {isLoading ? <Empty text="Loading…" /> : data.total ? <TrendChart points={trend} /> : <Empty text="No customers in this period." />}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6" aria-labelledby="services-title">
          <h2 id="services-title" className="text-base font-semibold text-gray-900">Customers by service</h2>
          <p className="text-sm text-gray-500">Share of all customers in this period</p>
          {isLoading ? (
            <Empty text="Loading…" />
          ) : data.total ? (
            <ul className="mt-5 space-y-3.5">
              {data.services.map((s: any) => (
                <li key={s.id ?? s.name} className="group" title={`${s.name}: ${s.count} customers (${pct(s.count, data.total)}%)`}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-gray-700">{s.name}</span>
                    <span className="tabular-nums text-gray-500">
                      <span className="font-medium text-gray-900">{pct(s.count, data.total)}%</span> · {s.count}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-primary transition-[width] group-hover:opacity-80" style={{ width: `${pct(s.count, data.total)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No customers in this period." />
          )}
        </section>
      </div>

      {/* Staff table */}
      <section className="rounded-2xl border border-gray-200 bg-white" aria-labelledby="staff-title">
        <div className="flex flex-col gap-1 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div>
            <h2 id="staff-title" className="text-base font-semibold text-gray-900">Customers by staff member</h2>
            <p className="text-sm text-gray-500">Who completed or cancelled customers who applied in this period</p>
          </div>
        </div>

        {!isLoading && data.staff.length === 0 ? (
          <div className="border-t border-gray-200 p-5 sm:p-6">
            <Empty text="Nobody has handled a customer in this period yet." />
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-medium">Staff member</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Handled</th>
                    {HANDLED_STATUSES.map((s: any) => (
                      <th key={s.key} scope="col" className="px-4 py-3 text-right font-medium">{s.label}</th>
                    ))}
                    <th scope="col" className="px-4 py-3 font-medium">Completion</th>
                    <th scope="col" className="px-6 py-3 text-right font-medium"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.staff.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3"><Person name={u.name} email={u.email} /></td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">{u.total}</td>
                      {HANDLED_STATUSES.map((s: any) => (
                        <td key={s.key} className="px-4 py-3 text-right tabular-nums text-gray-600">{u.counts[s.key] ?? 0}</td>
                      ))}
                      <td className="px-4 py-3"><Completion done={u.counts.completed ?? 0} total={u.total} /></td>
                      <td className="px-6 py-3 text-right">
                        <button className="btn-secondary h-8 px-3" onClick={() => setViewing(u.id)} disabled={!u.total}>
                          <Eye className="h-4 w-4" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <ul className="divide-y divide-gray-100 border-t border-gray-200 md:hidden">
              {data.staff.map((u: any) => (
                <li key={u.id} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Person name={u.name} />
                    <span className="text-lg font-semibold tabular-nums text-gray-900">{u.total}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                    {HANDLED_STATUSES.map((s: any) => (
                      <div key={s.key} className="rounded-lg bg-gray-50 px-1 py-2">
                        <p className="font-semibold tabular-nums text-gray-900">{u.counts[s.key] ?? 0}</p>
                        <p className="text-[11px] text-gray-500">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <button className="btn-secondary mt-3 w-full" onClick={() => setViewing(u.id)} disabled={!u.total}>
                    <Eye className="h-4 w-4" /> View customers
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <Modal
        open={!!viewingStaff}
        onClose={() => setViewing(null)}
        size="lg"
        title={viewingStaff?.name ?? ""}
        description={viewingStaff ? `${viewingStaff.total} customers handled · ${formatDay(from)} – ${formatDay(to)}` : undefined}
      >
        {viewingStaff && <StaffDetails staff={viewingStaff} from={from} to={to} />}
      </Modal>
    </div>
  );
}

// Customers handled by one staff member, loaded from the API
function StaffDetails({ staff, from, to }: { staff: any; from: string; to: string }) {
  const [status, setStatus] = useState<string>("all");

  const params: any = { updatedById: staff.id, from, to, page: 1, limit: 50 };
  if (status !== "all") params.status = status;

  const { data: res, isLoading } = useGetAllCustomers(params);
  const list: any[] = res?.data ?? [];
  const total: number = res?.total ?? 0;

  const filters = [
    { key: "all", label: "All", n: staff.total },
    ...HANDLED_STATUSES.map((s: any) => ({ key: s.key, label: s.label, n: staff.counts[s.key] ?? 0 })),
  ];

  return (
    <div className="px-5 py-5 sm:px-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={status === f.key}
            onClick={() => setStatus(f.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              status === f.key ? "border-primary bg-primary text-primary-foreground" : "border-gray-200 text-gray-600 hover:bg-gray-50",
            )}
          >
            {f.label} <span className="opacity-70">{f.n}</span>
          </button>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200">
        {isLoading ? (
          <li className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </li>
        ) : list.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-gray-500">No customers with this status.</li>
        ) : (
          list.map((c) => {
            const st: any = STATUS_LIST.find((s: any) => s.key === c.status) ?? STATUS_LIST[0];
            return (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">{c.names}</p>
                  <p className="text-xs text-gray-500">{c.service} · {formatDay(dayKey(c.createdAt), true)}</p>
                </div>
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", st.badge)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} /> {st.label}
                </span>
              </li>
            );
          })
        )}
      </ul>

      {total > 50 && (
        <p className="mt-3 text-center text-sm text-gray-500">
          Showing 50 of {total}.{" "}
          <Link href="/admin/customers" className="font-medium text-primary hover:underline">See all in Customers</Link>
        </p>
      )}
    </div>
  );
}

function Person({ name, email }: { name: string; email?: string }) {
  const initials = (name ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials}</span>
      <span className="min-w-0">
        <span className="block truncate font-medium text-gray-900">{name}</span>
        {email && <span className="block truncate text-xs text-gray-500">{email}</span>}
      </span>
    </span>
  );
}

function Completion({ done, total }: { done: number; total: number }) {
  const p = pct(done, total);
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
        <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${p}%` }} />
      </span>
      <span className="text-xs tabular-nums text-gray-500">{p}%</span>
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500">{text}</p>;
}