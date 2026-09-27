"use client";

import { useMemo } from "react";
import { Users, UserCheck, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function UsersStats({
    users,
    isLoading,
}: {
    users: any[];
    isLoading: boolean;
}) {
    const stats = useMemo(
        () => [
            {
                label: "Total Users",
                value: users.length,
                icon: Users,
                iconBg: "bg-blue-50",
                iconColor: "text-blue-500",
            },
            {
                label: "Active",
                value: users.filter((u) => u.isActive).length,
                icon: UserCheck,
                iconBg: "bg-emerald-50",
                iconColor: "text-emerald-500",
            },
            {
                label: "Inactive",
                value: users.filter((u) => !u.isActive).length,
                icon: UserX,
                iconBg: "bg-gray-100",
                iconColor: "text-gray-500",
            },
        ],
        [users]
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}>
                          <CardContent className="flex items-center gap-4 p-4">
                              <Skeleton className="h-11 w-11 rounded-full" />
                              <div className="space-y-2">
                                  <Skeleton className="h-6 w-12" />
                                  <Skeleton className="h-4 w-20" />
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
                                  <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
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
    );
}