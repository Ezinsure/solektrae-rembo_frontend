"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil } from "lucide-react";
import { statusAction, StatusBadge } from "@/components/common/statusBadge";
import { formatDateTime } from "@/lib/apiError";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/comfirmDialog";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = ["pending", "completed", "cancelled"];

const COLUMN_COUNT = 8;

const CustomersTable = ({
    customerData,
    customerLoading,
    onView,
    onEdit,
    onStatusChange,
    statusUpdating = false,
}: {
    customerData: any;
    customerLoading: boolean;
    onView: (customer: any) => void;
    onEdit: (customer: any) => void;
    onStatusChange: (customer: any, status: string, note: string | undefined, onDone: () => void) => void;
    statusUpdating?: boolean;
}) => {
    const customers = customerData?.data ?? [];
    const [pendingChange, setPendingChange] = useState<{ customer: any; status: string } | null>(null);
    const [statusOpen, setStatusOpen] = useState(false);
    const [note, setNote] = useState("");

    const action = pendingChange ? statusAction(pendingChange.status) : null;
    const isCancelling = pendingChange?.status === "cancelled";

    const openStatusDialog = (customer: any, status: string) => {
        setPendingChange({ customer, status });
        setNote("");
        setStatusOpen(true);
    };
    const closeStatusDialog = () => setStatusOpen(false);

    const confirmStatusChange = () => {
        if (!pendingChange) return;
        onStatusChange(
            pendingChange.customer,
            pendingChange.status,
            isCancelling ? note.trim() : undefined,
            closeStatusDialog,
        );
    };

    return (
        <>
            <Table>
                <TableHeader className="bg-[#11223320]">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold first:rounded-tl-xl last:rounded-tr-xl">Date</TableHead>
                        <TableHead className="font-semibold">Names</TableHead>
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Phone</TableHead>
                        <TableHead className="font-semibold">Service</TableHead>
                        {/* <TableHead className="font-semibold">District</TableHead> */}
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold last:rounded-tr-xl">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody className="border border-[#E9E9EB]  rounded-lg ">
                    {customerLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({ length: COLUMN_COUNT }).map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-4 w-full max-w-24" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : customers.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={COLUMN_COUNT}
                                className="text-center text-muted-foreground py-10"
                            >
                                No customers found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        customers.map((data: any) => (
                            <TableRow key={data.id}>
                                <TableCell>{formatDateTime(data.createdAt)}</TableCell>
                                <TableCell>{data?.names}</TableCell>
                                <TableCell>{data?.email}</TableCell>
                                <TableCell>{data?.phoneNumber}</TableCell>
                                <TableCell className="capitalize">{data?.service}</TableCell>
                                <TableCell>
                                    <StatusBadge status={data?.status} />
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger
                                            render={
                                                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${data.names}`}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            }
                                        />
                                        <DropdownMenuContent align="end" className="w-52">
                                            <DropdownMenuGroup>
                                                <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => onView(data)}>
                                                    <Eye className="mr-2 h-4 w-4" /> View details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem disabled={data.status !== "pending"} onClick={() => onEdit(data)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                            </DropdownMenuGroup>

                                            {data.status === "pending" && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuLabel className="text-xs text-muted-foreground">Update status</DropdownMenuLabel>
                                                        {STATUS_OPTIONS.filter((s: string) => s !== "pending").map((s: string) => {
                                                            const a = statusAction(s);
                                                            return (
                                                                <DropdownMenuItem
                                                                    key={s}
                                                                    className={a.itemClass}
                                                                    onClick={() => openStatusDialog(data, s)}
                                                                >
                                                                    <a.icon className="mr-2 h-4 w-4" />
                                                                    {a.label}
                                                                </DropdownMenuItem>
                                                            );
                                                        })}
                                                    </DropdownMenuGroup>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            <ConfirmDialog
                open={statusOpen}
                onOpenChange={(open) => !open && !statusUpdating && closeStatusDialog()}
                variant={action?.variant ?? "default"}
                title={action?.title ?? "Update status?"}
                isLoading={statusUpdating}
                confirmDisabled={isCancelling && !note.trim()}
                description={
                    pendingChange && (
                        <div className="space-y-3">
                            <p>Please confirm you want to update this application. This action is irreversible.</p>
                            <div className="rounded-lg border-[.4] bg-muted/20 p-3 px-5 text-left mt-8">
                                <p className="font-medium text-foreground">{pendingChange.customer.names}</p>
                                <p className="text-xs text-muted-foreground">{pendingChange.customer.service}</p>
                                <div className="mt-2 flex items-center gap-2 text-xs">
                                    <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium capitalize text-amber-700">
                                        {pendingChange.customer.status}
                                    </span>
                                    <span className="text-muted-foreground">→</span>
                                    <span
                                        className={cn(
                                            "rounded-full px-2 py-0.5 font-medium capitalize",
                                            pendingChange.status === "completed" && "bg-emerald-100 text-emerald-700",
                                            pendingChange.status === "cancelled" && "bg-red-100 text-red-700",
                                            !["completed", "cancelled"].includes(pendingChange.status) && "bg-gray-100 text-gray-700",
                                        )}
                                    >
                                        {pendingChange.status.replace(/_/g, " ")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                }
                confirmLabel={action?.confirm ?? "Yes, update"}
                cancelLabel="No, go back"
                loadingLabel="Updating…"
                onConfirm={confirmStatusChange}
            >
                {isCancelling && (
                    <div className="mx-auto w-full max-w-xl justify-self-center space-y-2 text-left">
                        <label htmlFor="status-note" className="block text-sm font-medium">
                            Reason for cancelling <span className="text-destructive">*</span>
                        </label>
                        <textarea
                            id="status-note"
                            value={note}
                            onChange={(e) => setNote(e.target.value.slice(0, 500))}
                            placeholder="Why is this application being cancelled?"
                            rows={3}
                            className="w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                        />
                        <p className="text-right text-xs text-muted-foreground">{note.length}/500</p>
                    </div>
                )}
            </ConfirmDialog>
        </>
    );
};
export default CustomersTable;
