"use client";

import {
  useGetAllCustomers,
  useUpdateCustomerStatus,
} from "@/hooks/useCustomer";
import CustomersHeader, { rangeParams } from "./customerHeader";
import CustomersTable from "./customerDatas";
import { useMemo, useState } from "react";
import { ViewDrawer } from "@/components/drawer/viewDrawer";
import { ViewCustomer } from "./viewCustomer";
import { FormModal } from "@/components/modal/editModal";
import { CustomerForm } from "@/components/forms/custtomerForm";
import PaginatePage from "@/components/pagination/page";
import { useDebouncedValue } from "@/hooks/useDebounceValue";
import { TableFilters } from "@/components/ui/tableFilter";
import { DateRange } from "react-day-picker";
import { useServices } from "@/hooks/useServices";
import { startOfDay} from "date-fns";

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const todayRange = (): DateRange => {
  const today = startOfDay(new Date());
  return { from: today, to: today };
};

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(todayRange);
  const updateCustomerStatus = useUpdateCustomerStatus();
  const [serviceId, setServiceId] = useState("all");
  const { data: services = [] } = useServices({ includeInactive: true });

  const serviceOptions = useMemo(
    () => [
      { label: "All services", value: "all" },
      ...services.map((s: any) => ({ label: s.name, value: s.id })),
    ],
    [services],
  );

  const filters = useMemo(() => {
    const f: any = { ...rangeParams(dateRange) };
    if (debouncedSearch?.trim()) f.search = debouncedSearch.trim();
    if (status !== "all") f.status = status;
    if (serviceId !== "all") f.serviceId = serviceId;
    return f;
  }, [dateRange, debouncedSearch, status, serviceId]);

  const { data: customerData, isLoading: customerLoading } = useGetAllCustomers({
    ...filters,
    page,
    limit: pageSize,
  })
  const totalItems = customerData?.total ?? 0;

  return (
    <div className=" min-h-[83vh]">
      <CustomersHeader
        dateRange={dateRange}
        onDateRangeChange={(range) => {
          setDateRange(range);
          setPage(1);
        }}
        onCreate={() => setCreateOpen(true)}
        exportParams={filters}
      />

      <div className="my-6 rounded-xl border bg-card p-3">
        <TableFilters
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search name, email, phone or service…"
          filters={[
            {
              value: serviceId,
              onChange: (value) => {
                setServiceId(value);
                setPage(1);
              },
              options: serviceOptions,
              placeholder: "Filter by service",
            },
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

      <div className="py-2 scroll-auto">
        <CustomersTable
          customerLoading={customerLoading}
          customerData={customerData}
          statusUpdating={updateCustomerStatus.isPending}
          onView={(customer) => {
            setSelectedCustomer(customer);
            setViewOpen(true);
          }}
          onEdit={(customer) => {
            setSelectedCustomer(customer);
            setEditOpen(true);
          }}
          onStatusChange={(customer, status, note, onDone) => {
            updateCustomerStatus.mutate(
              { id: customer.id, status, note },
              { onSuccess: onDone },
            );
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
