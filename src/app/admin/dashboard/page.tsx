"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, CircleDashed, Clock, Eye, Users, XCircle } from "lucide-react";
import Modal from "@/components/modal/settingModal";
import {
    SAMPLE_TODAY, SERVICES, STAFF, STATUSES, addDays, dayKey, daysBetween, formatDay, sampleCustomers,
    type DashCustomer, type StatusKey,
} from "@/lib/dashboard/dashboard-data";
import { cn } from "@/lib/utils";
import TrendChart, { buildTrend } from "@/components/dashboard/TrendChart";

const PRESETS = [
    { label: "7 days", days: 6 },
    { label: "30 days", days: 29 },
    { label: "90 days", days: 89 },
] as const;

const STATUS_ICON: Record<StatusKey, typeof Clock> = {
    pending: Clock, in_progress: CircleDashed, completed: CheckCircle2, cancelled: XCircle,
};

const emptyCounts = () => Object.fromEntries(STATUSES.map((s) => [s.key, 0])) as Record<StatusKey, number>;
const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

export default function DashboardPage() {
    const today = SAMPLE_TODAY; // TODO: dayKey(new Date()) once data is real
    const [from, setFrom] = useState(addDays(today, -29));
    const [to, setTo] = useState(today);
    const [viewing, setViewing] = useState<string | null>(null);

    const days = Math.max(0, daysBetween(from, to));
    const activePreset = to === today ? PRESETS.find((p) => p.days === days)?.label : undefined;

    // TODO: replace with useDashboard({ from, to }) — the API returns these numbers
    const data = useMemo(() => {
        const inRange = sampleCustomers.filter((c) => { const d = dayKey(c.createdAt); return d >= from && d <= to; });

        // Same-length period just before, for the "vs previous period" line
        const prevTo = addDays(from, -1);
        const prevFrom = addDays(prevTo, -days);
        const previousTotal = sampleCustomers.filter((c) => { const d = dayKey(c.createdAt); return d >= prevFrom && d <= prevTo; }).length;

        const statusCounts = emptyCounts();
        inRange.forEach((c) => statusCounts[c.status]++);

        const services = SERVICES.map((s) => ({ ...s, count: inRange.filter((c) => c.service === s.key).length }))
            .sort((a, b) => b.count - a.count);

        const staff = STAFF.map((u) => {
            const theirs = inRange.filter((c) => c.createdById === u.id);
            const counts = emptyCounts();
            theirs.forEach((c) => counts[c.status]++);
            return { ...u, total: theirs.length, counts, customers: theirs };
        }).sort((a, b) => b.total - a.total);

        const trend = buildTrend(inRange.map((c) => dayKey(c.createdAt)), from, to, days);

        return { total: inRange.length, previousTotal, statusCounts, services, staff, trend };
    }, [from, to, days]);

    const change = data.previousTotal ? Math.round(((data.total - data.previousTotal) / data.previousTotal) * 100) : null;
    const viewingStaff = data.staff.find((s) => s.id === viewing) ?? null;

    return (
        <div >
            {/* Header + date range */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="mb-5">
                    <h1 className="text-2xl font-medium">Dashboard</h1>
                    <p className="text-muted-foreground">
                        {formatDay(from, true)} – {formatDay(to, true)} · {days + 1} days
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center mb-3">
                    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5" role="group" aria-label="Date range">
                        {PRESETS.map((p) => (
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

            {/* Summary tiles */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5 mb-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:col-span-2 xl:col-span-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500"><Users className="h-4 w-4" /> Total customers</div>
                    <p className="mt-3 text-3xl font-semibold text-gray-900">{data.total.toLocaleString()}</p>
                    {change !== null && (
                        <p className="mt-1 text-xs text-gray-500">
                            <span className={cn("font-medium", change >= 0 ? "text-emerald-700" : "text-red-700")}>{change >= 0 ? "▲" : "▼"} {Math.abs(change)}%</span>{" "}
                            vs previous {days + 1} days
                        </p>
                    )}
                </div>
                {STATUSES.map((s) => {
                    const Icon = STATUS_ICON[s.key];
                    const n = data.statusCounts[s.key];
                    return (
                        <div key={s.key} className="rounded-2xl border border-gray-200 bg-white p-5">
                            <div className="flex items-center gap-2 text-sm text-gray-500"><Icon className="h-4 w-4" /> {s.label}</div>
                            <p className="mt-3 text-3xl font-semibold text-gray-900">{n.toLocaleString()}</p>
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
            <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6" aria-labelledby="trend-title">
                    <h2 id="trend-title" className="text-base font-semibold text-gray-900">New customers</h2>
                    <p className="text-sm text-gray-500">{days > 45 ? "Per week" : "Per day"}, for the selected dates</p>
                    <div className="mt-4">
                        {data.total ? <TrendChart points={data.trend} /> : <Empty text="No customers in this period." />}
                    </div>
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6" aria-labelledby="services-title">
                    <h2 id="services-title" className="text-base font-semibold text-gray-900">Customers by service</h2>
                    <p className="text-sm text-gray-500">Share of all customers in this period</p>
                    {data.total ? (
                        <ul className="mt-5 space-y-3.5">
                            {data.services.map((s) => (
                                <li key={s.key} className="group" title={`${s.label}: ${s.count} customers (${pct(s.count, data.total)}%)`}>
                                    <div className="flex items-baseline justify-between gap-3 text-sm">
                                        <span className="text-gray-700">{s.label}</span>
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
                        <p className="text-sm text-gray-500">Who registered customers in this period, and where they are now</p>
                    </div>
                </div>

                {/* Desktop */}
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left text-sm">
                        <thead className="border-y border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-medium">Staff member</th>
                                <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
                                {STATUSES.map((s) => <th key={s.key} scope="col" className="px-4 py-3 text-right font-medium">{s.label}</th>)}
                                <th scope="col" className="px-4 py-3 font-medium">Completion</th>
                                <th scope="col" className="px-6 py-3 text-right font-medium"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.staff.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3"><Person name={u.name} email={u.email} /></td>
                                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">{u.total}</td>
                                    {STATUSES.map((s) => <td key={s.key} className="px-4 py-3 text-right tabular-nums text-gray-600">{u.counts[s.key]}</td>)}
                                    <td className="px-4 py-3"><Completion done={u.counts.completed} total={u.total} /></td>
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
                    {data.staff.map((u) => (
                        <li key={u.id} className="p-4">
                            <div className="flex items-center justify-between gap-3">
                                <Person name={u.name} />
                                <span className="text-lg font-semibold tabular-nums text-gray-900">{u.total}</span>
                            </div>
                            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                                {STATUSES.map((s) => (
                                    <div key={s.key} className="rounded-lg bg-gray-50 px-1 py-2">
                                        <p className="font-semibold tabular-nums text-gray-900">{u.counts[s.key]}</p>
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
            </section>

            <Modal
                open={!!viewingStaff}
                onClose={() => setViewing(null)}
                size="lg"
                title={viewingStaff?.name ?? ""}
                description={viewingStaff ? `${viewingStaff.total} customers · ${formatDay(from)} – ${formatDay(to)}` : undefined}
            >
                {viewingStaff && <StaffDetails customers={viewingStaff.customers} counts={viewingStaff.counts} />}
            </Modal>
        </div>
    );
}

function StaffDetails({ customers, counts }: { customers: DashCustomer[]; counts: Record<StatusKey, number> }) {
    const [status, setStatus] = useState<"all" | StatusKey>("all");
    const list = customers.filter((c) => status === "all" || c.status === status);
    const serviceLabel = (k: string) => SERVICES.find((s) => s.key === k)?.label ?? k;

    return (
        <div className="px-5 py-5 sm:px-6">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
                {[{ key: "all" as const, label: "All", n: customers.length }, ...STATUSES.map((s) => ({ key: s.key, label: s.label, n: counts[s.key] }))].map((f) => (
                    <button
                        key={f.key}
                        type="button"
                        aria-pressed={status === f.key}
                        onClick={() => setStatus(f.key)}
                        className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors", status === f.key ? "border-primary bg-primary text-primary-foreground" : "border-gray-200 text-gray-600 hover:bg-gray-50")}
                    >
                        {f.label} <span className="opacity-70">{f.n}</span>
                    </button>
                ))}
            </div>

            <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200">
                {list.slice(0, 50).map((c) => {
                    const st = STATUSES.find((s) => s.key === c.status)!;
                    return (
                        <li key={c.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-gray-900">{c.name}</p>
                                <p className="text-xs text-gray-500">{serviceLabel(c.service)} · {formatDay(dayKey(c.createdAt), true)}</p>
                            </div>
                            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", st.badge)}>
                                <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} /> {st.label}
                            </span>
                        </li>
                    );
                })}
                {list.length === 0 && <li className="px-4 py-8 text-center text-sm text-gray-500">No customers with this status.</li>}
            </ul>
            {list.length > 50 && (
                <p className="mt-3 text-center text-sm text-gray-500">
                    Showing 50 of {list.length}. <Link href="/admin/customers" className="font-medium text-primary hover:underline">See all in Customers</Link>
                </p>
            )}
        </div>
    );
}

function Person({ name, email }: { name: string; email?: string }) {
    const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
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