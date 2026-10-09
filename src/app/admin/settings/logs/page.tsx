"use client";

import { useState } from "react";
import { Download, Loader2, Search } from "lucide-react";
import { EmptyState, PageHeader, inputClass } from "@/components/settings/ui";
import { cn } from "@/lib/utils";
import Modal from "@/components/modal/settingModal";
import { useExportLogs, useGetAllLogs } from "@/hooks/useLogs";
import { useDebouncedValue } from "@/hooks/useDebounceValue";
import PaginatePage from "@/components/pagination/page";
import { actionMeta, entityLabel } from "@/components/common/statusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    timeZone: "Africa/Kigali",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const showValue = (v: any) =>
  v === null || v === ""
    ? "empty"
    : typeof v === "boolean"
      ? v
        ? "Yes"
        : "No"
      : String(v);

const LogsPage = () => {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<any>("all");
  const [entity, setEntity] = useState<any>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<any>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const filters: any = {
    search: debouncedSearch.trim() || undefined,
    action: action === "all" ? undefined : action,
    entity: entity === "all" ? undefined : entity,
    from: from || undefined,
    to: to || undefined,
  };

  const { data, isLoading, isFetching, isError } = useGetAllLogs({
    ...filters,
    page,
    limit: pageSize,
  });
  const exportLogs = useExportLogs();

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const hasFilters = !!(
    search ||
    action !== "all" ||
    entity !== "all" ||
    from ||
    to
  );

  const withReset =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(1);
    };
  const clearFilters = () => {
    setSearch("");
    setAction("all");
    setEntity("all");
    setFrom("");
    setTo("");
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="Activity logs"
        description="A record of sign-ins and changes made in the system."
        action={
          <Button
            className="btn-secondary"
            onClick={() => exportLogs.mutate(filters)}
            disabled={total === 0 || exportLogs.isPending}
            title={
              hasFilters
                ? "Exports all logs matching your filters"
                : "Exports all logs"
            }
          >
            {exportLogs.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exportLogs.isPending ? "Preparing..." : "Export CSV"}
          </Button>
        }
      />

      {/* Filters */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_10rem_10rem_9.5rem_9.5rem]">
        <label className="relative sm:col-span-2 xl:col-span-1">
          <span className="sr-only">Search logs</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => withReset(setSearch)(e.target.value)}
            placeholder="Search description, user or IP"
            className={`${inputClass} pl-9`}
          />
        </label>
        <select
          aria-label="Action"
          value={action}
          onChange={(e) =>
            withReset(setAction)(e.target.value as typeof action)
          }
          className={inputClass}
        >
          <option value="all">All actions</option>
          {Object.entries(actionMeta).map(([k, v]: any) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Area"
          value={entity}
          onChange={(e) =>
            withReset(setEntity)(e.target.value as typeof entity)
          }
          className={inputClass}
        >
          <option value="all">All areas</option>
          {Object.entries(entityLabel).map(([k, v]: any) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <Input
          type="date"
          aria-label="From date"
          value={from}
          max={to || undefined}
          onChange={(e) => withReset(setFrom)(e.target.value)}
          className={inputClass}
        />
        <Input
          type="date"
          aria-label="To date"
          value={to}
          min={from || undefined}
          onChange={(e) => withReset(setTo)(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-base font-medium text-[#112233]">
        <span className="flex items-center gap-2">
          {total.toLocaleString()} {total === 1 ? "entry" : "entries"}
          {isFetching && !isLoading && (
            <Loader2
              className="h-3.5 w-3.5 animate-spin"
              aria-label="Updating"
            />
          )}
        </span>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="font-medium text-primary hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingRows />
      ) : isError ? (
        <div className="mt-4">
          <EmptyState
            title="Couldn't load activity"
            text="Please refresh the page or try again later."
          />
        </div>
      ) : logs.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No activity found"
            text={
              hasFilters
                ? "Try different filters or dates."
                : "Activity will appear here as people use the system."
            }
          />
        </div>
      ) : (
        <div className={cn("transition-opacity", isFetching && "opacity-60")}>
          {/* Desktop table */}
          <div className="mt-3 hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Time
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    User
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Action
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Description
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    IP address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((l: any) => (
                  <tr
                    key={l.id}
                    onClick={() => setSelected(l)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {formatTime(l.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Actor name={l.actorName} />
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge action={l.action} />
                    </td>
                    <td className="px-4 py-3">
                      {/* Button makes each row reachable by keyboard */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(l);
                        }}
                        className="text-left text-gray-900 hover:text-primary focus-visible:outline-none focus-visible:underline"
                      >
                        {l?.summary}
                      </button>
                      <span className="mt-0.5 block text-xs text-gray-400">
                        {entityLabel[l.entity] ?? l.entity}
                        {l.changes?.length
                          ? ` · ${l.changes.length} ${l.changes.length === 1 ? "change" : "changes"}`
                          : ""}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-500">
                      {l.ip ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <ul className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200 md:hidden">
            {logs.map((l: any) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => setSelected(l)}
                  className="w-full p-4 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <ActionBadge action={l.action} />
                    <span className="text-xs text-gray-400">
                      {formatTime(l.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-900">{l?.summary}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {l.actorName ?? "System"} ·{" "}
                    {entityLabel[l.entity] ?? l.entity}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          {total > pageSize && (
            <div className="mt-4">
              <PaginatePage
                page={page}
                pageSize={pageSize}
                totalItems={total}
                onPageChange={setPage}
                onPageSizeChange={(size: number) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            </div>
          )}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Activity details"
        description={selected?.summary}
      >
        {selected && <LogDetails log={selected} />}
      </Modal>
    </div>
  );
};
export default LogsPage;

function ActionBadge({ action }: any) {
  const m = (actionMeta as any)[action] ?? {
    label: String(action),
    className: "bg-gray-100 text-gray-700 ring-gray-500/15",
  };
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        m.className,
      )}
    >
      {m.label}
    </span>
  );
}

function Actor({ name }: any) {
  if (!name) return <span className="text-gray-400">System</span>;
  const initials = name
    ?.split(" ")
    .map((p: any) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
        {initials}
      </span>
      <span className="text-gray-800">{name}</span>
    </span>
  );
}

function LoadingRows() {
  return (
    <div className="mt-3 space-y-2" aria-label="Loading activity">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
      ))}
    </div>
  );
}

function LogDetails({ log }: any) {
  const rows: [string, React.ReactNode][] = [
    ["Time", formatTime(log.createdAt)],
    ["User", log.actorName ?? "System"],
    ["Action", <ActionBadge key="a" action={log.action} />],
    [
      "Area",
      `${entityLabel[log.entity] ?? log.entity}${log.entityId ? ` · ${log.entityId}` : ""}`,
    ],
    ["IP address", log.ip ?? "—"],
    ["Device", log.userAgent ?? "—"],
  ];

  return (
    <div className="px-5 py-5 sm:px-6">
      <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-3 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-gray-500">{k}</dt>
            <dd className="min-w-0 break-words text-gray-900">{v}</dd>
          </div>
        ))}
      </dl>

      {log.changes && log.changes.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-gray-900">Changes</p>
          <ul className="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-200 text-sm">
            {log.changes.map((c: any) => (
              <li
                key={c.field}
                className="grid gap-1 p-3 sm:grid-cols-[8rem_1fr]"
              >
                <span className="text-gray-500">{c.field}</span>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="break-all rounded bg-red-50 px-1.5 py-0.5 text-red-700 line-through decoration-red-300">
                    {showValue(c.from)}
                  </span>
                  <span aria-hidden className="text-gray-400">
                    →
                  </span>
                  <span className="sr-only">changed to</span>
                  <span className="break-all rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">
                    {showValue(c.to)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
