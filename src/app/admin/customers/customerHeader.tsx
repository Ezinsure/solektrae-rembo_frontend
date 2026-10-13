"use client";

import { useMemo } from "react";
import { Users, CheckCircle2, Clock, XCircle, Download, Plus, Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCustomerStats, useExportCustomers } from "@/hooks/useCustomer";
import { DateRangePicker } from "@/components/dateRange";
import { useGetMe } from "@/hooks/useAuth";

const toDay = (d?: Date) => {
    if (!d) return undefined;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const rangeParams = (range?: DateRange) => {
    const from = toDay(range?.from);
    const to = toDay(range?.to ?? range?.from);
    return from ? { from, to } : {};
};

const CustomersHeader = ({
    dateRange,
    onDateRangeChange,
    onCreate,
    exportParams,
}: {
    dateRange: DateRange | undefined;
    onDateRangeChange: (range: DateRange | undefined) => void;
    onCreate: () => void;
    exportParams?: any;
}) => {
    const range = useMemo(() => rangeParams(dateRange), [dateRange]);
    const { data: stats, isLoading } = useCustomerStats(range);
    const exportCustomers = useExportCustomers();
    const { data: user } = useGetMe();
    const hasAccess = ["dev", "admin"].includes(user?.role ?? "");

    const cards = [
        { label: "Total customers", value: stats?.total ?? 0, icon: Users, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
        { label: "Completed", value: stats?.byStatus?.completed ?? 0, icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-500" },
        { label: "Pending", value: stats?.byStatus?.pending ?? 0, icon: Clock, iconBg: "bg-amber-50", iconColor: "text-amber-500" },
        { label: "Cancelled", value: stats?.byStatus?.cancelled ?? 0, icon: XCircle, iconBg: "bg-red-50", iconColor: "text-red-500" },
    ];

    const handleExport = () => exportCustomers.mutate({ ...exportParams, ...range });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
                    <p className="text-sm text-muted-foreground">Track applications and update their status.</p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
                    <div className="flex gap-2">
                        {hasAccess && <Button
                            variant="outline"
                            onClick={handleExport}
                            disabled={exportCustomers.isPending}
                            className="flex-1 sm:flex-none"
                        >
                            {exportCustomers.isPending ? <Loader2 className="animate-spin" /> : <Download />}
                            Download CSV
                        </Button>}
                        <Button onClick={onCreate} className="flex-1 sm:flex-none">
                            <Plus />
                            New customer
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="flex items-center gap-4 p-4">
                                <Skeleton className="h-11 w-11 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-12" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                    : cards.map((stat) => (
                        <Card key={stat.label}>
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", stat.iconBg)}>
                                    <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-2xl font-semibold leading-none">{stat?.value?.toLocaleString()}</p>
                                    <p className="mt-1 truncate text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
            </div>
        </div>
    );
};

export default CustomersHeader;