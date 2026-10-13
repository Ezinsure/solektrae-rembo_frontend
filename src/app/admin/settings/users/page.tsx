"use client";

import { useEffect, useMemo, useState } from "react";
import { useDeleteUser, useGetAllUsers } from "@/hooks/useUser";
import { Skeleton } from "@/components/ui/skeleton";
import { TableFilters } from "@/components/ui/tableFilter";
import { UsersStats } from "./userStats";
import { UserCard } from "./userCard";
import PaginatePage from "@/components/pagination/page";
import { ViewDrawer } from "@/components/drawer/viewDrawer";
import { ViewUser } from "./viewUser";
import { FormModal } from "@/components/modal/editModal";
import { Plus } from "lucide-react";
import { UserForm } from "@/components/forms/userForm";
import AdminPasswordDialog from "@/components/modal/ResetPasswd";
import ConfirmDialog from "@/components/modal/deleteDialog";
import { PageHeader } from "@/components/settings/ui";
import { useRoles } from "@/hooks/useRoles";
import { useMyCompanies } from "@/hooks/useCompany";

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const SettingsView = () => {
  const deleteUser = useDeleteUser();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  // small debounce so we don't call the API on every key press
  const useDebounced = (value: string, delay = 400) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const t = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
  };

  const debouncedSearch = useDebounced(search);

  const filters = useMemo(() => {
    const f: any = { page, limit: pageSize };
    if (debouncedSearch.trim()) f.search = debouncedSearch.trim();
    if (role !== "all") f.roleId = role;
    if (status !== "all") f.isActive = status === "active";
    return f;
  }, [page, pageSize, debouncedSearch, role, status]);

  const { data: res, isLoading, isFetching } = useGetAllUsers(filters);
  const users = res?.data ?? [];
  const total = res?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const { data: allRoles = [] } = useRoles();
  const { data: companies = [] } = useMyCompanies();
  const isDev = companies.find((c: any) => c.isCurrent)?.role === "dev";

  const roleOptions = useMemo(
    () => [
      { label: "All roles", value: "all" },
      ...allRoles
        .filter((r: any) => r.baseRole !== "dev" || isDev)
        .map((r: any) => ({ label: r.name, value: r.id })),
    ],
    [allRoles, isDev],
  );

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage all users."
        action={
          <button
            className="btn-primary"
            onClick={() => {
              setEditOpen(false);
              setCreateOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New User
          </button>
        }
      />
      <div className="py-6 space-y-6">
        <UsersStats users={users} isLoading={isLoading} />

        <div className="flex justify-between my-8">
          <div className="font-medium">
            Total from filter: {total}
            {isFetching && (
              <span className="ml-2 text-xs text-muted-foreground">
                Updating…
              </span>
            )}
          </div>

          <TableFilters
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search users..."
            filters={[
              {
                value: role,
                onChange: (value) => {
                  setRole(value);
                  setPage(1);
                },
                options: roleOptions,
                placeholder: "Filter by role",
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <div className="flex items-start gap-3 p-5 pb-4">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2 pt-0.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16 rounded-md" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <div className="space-y-2.5 px-5 pb-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-3.5 w-40" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-3.5 w-28" />
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between border-t bg-gray-50/70 px-5 py-3">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            ))
          ) : total === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-10">
              No users found.
            </p>
          ) : (
            users.map((u: any) => (
              <UserCard
                key={u.id}
                user={u}
                onView={(user) => {
                  setSelectedUser(user);
                  setViewOpen(true);
                }}
                onEdit={(user) => {
                  setSelectedUser(user);
                  setEditOpen(true);
                }}
                onDelete={(user) => {
                  setSelectedUser(user);
                  setDeleteOpen(true);
                }}
                onChangePassword={(user) => {
                  setSelectedUser(user);
                  setPasswordOpen(true);
                }}
              />
            ))
          )}
        </div>

        <PaginatePage
          page={page}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[15, 25, 50, 100]}
        />
      </div>

      {/* View Modal */}
      {selectedUser && (
        <ViewDrawer
          open={viewOpen}
          onOpenChange={setViewOpen}
          title="User Details"
          description="View user information"
        >
          {selectedUser && <ViewUser user={selectedUser} />}
        </ViewDrawer>
      )}

      {/* Create */}
      <FormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New User"
      >
        <UserForm onSuccess={() => setCreateOpen(false)} />
      </FormModal>

      {/* update */}
      <FormModal open={editOpen} onOpenChange={setEditOpen} title="Edit User">
        {selectedUser && (
          <UserForm
            key={selectedUser.id}
            user={selectedUser}
            onSuccess={() => setEditOpen(false)}
          />
        )}
      </FormModal>

      {/* delete user */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        variant="destructive"
        title="Delete user?"
        description={
          <>
            <span className="font-medium text-foreground">
              {selectedUser?.names}
            </span>{" "}
            will lose access immediately.
          </>
        }
        onConfirm={() => deleteUser.mutateAsync(selectedUser!.id)}
      />

      {/* update password */}
      <AdminPasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        user={selectedUser}
      />
    </div>
  );
};
export default SettingsView;
