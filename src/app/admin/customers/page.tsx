"use client";


import {
    useGetAllCustomers,
    useUpdateCustomerStatus,
} from "@/hooks/useCustomer";
import CustomersHeader from "./customerHeader";
import CustomersTable from "./customerDatas";
import { useState } from "react";
import { ViewDrawer } from "@/components/drawer/viewDrawer";
import { ViewCustomer } from "./viewCustomer";
import { FormModal } from "@/components/modal/editModal";
import { CustomerForm } from "@/components/forms/custtomerForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PaginatePage from "@/components/pagination/page";
import { useDebouncedValue } from "@/hooks/useDebounceValue";
import { TableFilters } from "@/components/ui/tableFilter";
import { DateRange } from "react-day-picker";

const STATUS_OPTIONS = [
    { label: "All statuses", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
];

const CustomersView = () => {
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [pageSize, setPageSize] = useState(25);
    const debouncedSearch = useDebouncedValue(search, 400);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const updateCustomerStatus = useUpdateCustomerStatus();
    const { data: customerData, isLoading: customerLoading } =
        useGetAllCustomers({
            search: debouncedSearch,
            ...(status !== "all" && { status }),
            page,
            limit: pageSize,
        });
    const totalItems = customerData?.total ?? 0;

    const filteredData = {
        ...customerData,
        data: (customerData?.data ?? []).filter((c: any) => {
            if (!dateRange?.from) return true;
            const created = new Date(c.createdAt);
            const from = new Date(dateRange.from);
            from.setHours(0, 0, 0, 0);
            const to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
            to.setHours(23, 59, 59, 999);
            return created >= from && created <= to;
        }),
    };

    return (
        <div>
            <CustomersHeader
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
            />
            <div className="flex justify-between my-4" >
                <Button onClick={() => setCreateOpen(true)}>
                    {" "}
                    <Plus />
                    New Customer
                </Button>
                <TableFilters
                    search={search}
                    onSearchChange={(value) => {
                        setSearch(value);
                        setPage(1);
                    }}
                    searchPlaceholder="Search customers..."
                    filters={[
                        {
                            value: status,
                            onChange: (value) => {
                                setStatus(value);
                                setPage(1);
                            },
                            options: STATUS_OPTIONS,
                            placeholder: "Filter by status",
                        },
                    ]}
                />
            </div>
            <div className="py-2">
                <CustomersTable
                    // customerData={customerData}
                    customerLoading={customerLoading}
                    customerData={filteredData}
                    onView={(customer) => {
                        setSelectedCustomer(customer);
                        setViewOpen(true);
                    }}
                    onEdit={(customer) => {
                        setSelectedCustomer(customer);
                        setEditOpen(true);
                    }}
                    onStatusChange={(customer, status) => {
                        updateCustomerStatus.mutate({ id: customer.id, status });
                    }}
                />
            </div>

            {/* Create */}
            <FormModal
                open={createOpen}
                onOpenChange={setCreateOpen}
            // title="New Customer"
            // description="Fill in the customer's details."
            >
                <CustomerForm onSuccess={() => setCreateOpen(false)} />
            </FormModal>

            {/* View Modal */}
            {selectedCustomer && (
                <ViewDrawer
                    open={viewOpen}
                    onOpenChange={setViewOpen}
                    title="Customer Details"
                    description="View customer information"
                >
                    {selectedCustomer && <ViewCustomer customer={selectedCustomer} />}
                </ViewDrawer>
            )}

            {/* Edit Modal */}
            <FormModal
                open={editOpen}
                onOpenChange={setEditOpen}
            // title="Edit Customer"
            // description="Update the customer's details."
            >
                {selectedCustomer && (
                    <CustomerForm
                        customer={selectedCustomer}
                        onSuccess={() => setEditOpen(false)}
                    />
                )}
            </FormModal>
            <PaginatePage
                page={page}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
            />
        </div>
    );
};
export default CustomersView;
