import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-50 text-amber-600 border-amber-200",
    "in-progress": "bg-blue-50 text-blue-600 border-blue-200",
    completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
    active: "bg-emerald-50 text-emerald-600 border-emerald-200",
    inactive: "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    active: "Active",
    inactive: "Inactive",
};

interface StatusBadgeProps {
    status?: string | null;
    className?: string;
}

export function StatusBadge({
    status,
    className,
}: StatusBadgeProps) {
    const normalizedStatus = status?.toLowerCase() ?? "";

    return (
        <Badge
            variant="outline"
            className={cn(
                "capitalize",
                STATUS_STYLES[normalizedStatus] ??
                "bg-gray-50 text-gray-600 border-gray-200",
                className,
            )}
        >
            {STATUS_LABELS[normalizedStatus] ?? status ?? "Unknown"}
        </Badge>
    );
}

export const actionMeta: any = {
    create: { label: "Created", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
    update: { label: "Updated", className: "bg-blue-50 text-blue-700 ring-blue-600/20" },
    delete: { label: "Deleted", className: "bg-red-50 text-red-700 ring-red-600/20" },
    restore: { label: "Restored", className: "bg-violet-50 text-violet-700 ring-violet-600/20" },
    login: { label: "Signed in", className: "bg-gray-100 text-gray-700 ring-gray-500/15" },
    logout: { label: "Signed out", className: "bg-gray-100 text-gray-700 ring-gray-500/15" },
    login_failed: { label: "Failed login", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
    password_reset: { label: "Password reset", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
    password_change: { label: "Password changed", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
};

export const entityLabel: any = {
    customer: "Customer", user: "User", role: "Role", service: "Service", company: "Company", auth: "Sign-in",
};