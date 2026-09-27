import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-50 text-amber-600 border-amber-200",
    "in-progress": "bg-blue-50 text-blue-600 border-blue-200",
    completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
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