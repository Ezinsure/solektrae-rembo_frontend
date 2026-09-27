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
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, CircleDot } from "lucide-react";
import { StatusBadge } from "@/components/common/statusBadge";
import { formatDateTime } from "@/lib/apiError";

const STATUS_OPTIONS = ["pending", "completed", "cancelled"];

const COLUMN_COUNT = 8;

const CustomersTable = ({
    customerData,
    customerLoading,
    onView,
    onEdit,
    onStatusChange,
}: {
    customerData: any;
    customerLoading: boolean;
    onView: (customer: any) => void;
    onEdit: (customer: any) => void;
    onStatusChange: (customer: any, status: string) => void;
}) => {
    const customers = customerData?.data ?? [];

    return (
        <Table>
            <TableHeader className="bg-[#E9E9EB] rounded-t-lg!">
                <TableRow>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Names</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">Service</TableHead>
                    <TableHead className="font-semibold">District</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold ">
                        Actions
                    </TableHead>
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
                            <TableCell>{data?.service}</TableCell>
                            <TableCell>{data?.district}</TableCell>
                            <TableCell>
                                <StatusBadge status={data?.status} />
                            </TableCell>
                            <TableCell >
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => onView(data)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(data)}>
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>
                                                    <CircleDot className="h-4 w-4 mr-2" />
                                                    Update Status
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent>
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <DropdownMenuItem
                                                            key={s}
                                                            disabled={data.status === s}
                                                            className="capitalize"
                                                            onClick={() =>
                                                                onStatusChange(data, s)
                                                            }
                                                        >
                                                            {s}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
};
export default CustomersTable;