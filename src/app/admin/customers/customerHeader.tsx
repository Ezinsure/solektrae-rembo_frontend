// CustomersHeader.tsx
"use client";

import { useMemo } from "react";
import { Users, CheckCircle2, Clock, XCircle } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetAllCustomers } from "@/hooks/useCustomer";
import { DateRangePicker } from "@/components/dateRange";

function isWithinRange(dateStr: string, range: DateRange | undefined) {
    if (!range?.from) return true; // no range selected — include everything
    const date = new Date(dateStr);
    const from = new Date(range.from);
    from.setHours(0, 0, 0, 0);

    if (!range.to) {
        // Only a start date picked — match that single day
        const to = new Date(range.from);
        to.setHours(23, 59, 59, 999);
        return date >= from && date <= to;
    }

    const to = new Date(range.to);
    to.setHours(23, 59, 59, 999);
    return date >= from && date <= to;
}

const CustomersHeader = ({
    dateRange,
    onDateRangeChange,
}: {
    dateRange: DateRange | undefined;
    onDateRangeChange: (range: DateRange | undefined) => void;
}) => {
    const { data: customerData, isLoading: customerLoading } =
        useGetAllCustomers();

    const customers = customerData?.data ?? [];

    const filteredCustomers = useMemo(
        () =>
            customers.filter((c: any) =>
                isWithinRange(c.createdAt, dateRange)
            ),
        [customers, dateRange]
    );

    const stats = useMemo(
        () => [
            {
                label: "Total Customers",
                value: filteredCustomers.length,
                icon: Users,
                iconBg: "bg-blue-50",
                iconColor: "text-blue-500",
            },
            {
                label: "Total Completed",
                value: filteredCustomers.filter(
                    (c: any) => c.status === "completed"
                ).length,
                icon: CheckCircle2,
                iconBg: "bg-emerald-50",
                iconColor: "text-emerald-500",
            },
            {
                label: "Total Pending",
                value: filteredCustomers.filter(
                    (c: any) => c.status === "pending"
                ).length,
                icon: Clock,
                iconBg: "bg-amber-50",
                iconColor: "text-amber-500",
            },
            {
                label: "Total Cancelled",
                value: filteredCustomers.filter(
                    (c: any) => c.status === "cancelled"
                ).length,
                icon: XCircle,
                iconBg: "bg-red-50",
                iconColor: "text-red-500",
            },
        ],
        [filteredCustomers]
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h1 className="text-2xl font-medium">Customers</h1>
                    <p className="text-muted-foreground">Manage customers here.</p>
                </div>
                <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
            </div>

            <div className="py-6 space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {customerLoading
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
                        : stats.map((stat) => (
                              <Card key={stat.label}>
                                  <CardContent className="flex items-center gap-4 p-4">
                                      <div
                                          className={cn(
                                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                                              stat.iconBg
                                          )}
                                      >
                                          <stat.icon
                                              className={cn("h-5 w-5", stat.iconColor)}
                                          />
                                      </div>
                                      <div>
                                          <p className="text-2xl font-semibold leading-none">
                                              {stat.value}
                                          </p>
                                          <p className="text-sm text-muted-foreground mt-1">
                                              {stat.label}
                                          </p>
                                      </div>
                                  </CardContent>
                              </Card>
                          ))}
                </div>
            </div>
        </div>
    );
};

export default CustomersHeader;