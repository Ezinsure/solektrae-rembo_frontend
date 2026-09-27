// app/admin/settings/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useGetAllUsers } from "@/hooks/useUser";
import { Skeleton } from "@/components/ui/skeleton";
import { TableFilters } from "@/components/ui/tableFilter";
import { UsersStats } from "./users/userStats";
import { UserCard } from "./users/userCard";
import PaginatePage from "@/components/pagination/page";
import { ViewDrawer } from "@/components/drawer/viewDrawer";
import { ViewUser } from "./users/viewUser";

const ROLE_OPTIONS = [
    { label: "All roles", value: "all" },
    { label: "Admin", value: "admin" },
    { label: "Staff", value: "staff" },
];

const STATUS_OPTIONS = [
    { label: "All statuses", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
];

const SettingsView = () => {
    const { data: userData, isLoading: userLoading } = useGetAllUsers();

    const [search, setSearch] = useState("");
    const [role, setRole] = useState("all");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);

    const users = userData?.data ?? [];

    const filteredUsers = useMemo(() => {
        return users.filter((u: any) => {
            const matchesSearch =
                !search ||
                u.names?.toLowerCase().includes(search.toLowerCase()) ||
                u.email?.toLowerCase().includes(search.toLowerCase());
            const matchesRole = role === "all" || u.role === role;
            const matchesStatus =
                status === "all" ||
                (status === "active" ? u.isActive : !u.isActive);
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, search, role, status]);

    const paginatedUsers = filteredUsers.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    return (
        <div>
            <h1 className="text-2xl font-medium">Settings</h1>
            <p className="text-muted-foreground">Manage all users.</p>

            <div className="py-6 space-y-6">
                <UsersStats users={users} isLoading={userLoading} />

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
                            options: ROLE_OPTIONS,
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

                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
                    {userLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="rounded-xl border p-5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-11 w-11 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-20" />
                            </div>
                        ))
                    ) : paginatedUsers.length === 0 ? (
                        <p className="col-span-full text-center text-muted-foreground py-10">
                            No users found.
                        </p>
                    ) : (
                        paginatedUsers.map((u: any) => (
                            <UserCard
                                key={u.id}
                                user={u}
                                onView={(user) => {
                                    setSelectedUser(user);
                                    setViewOpen(true);
                                }}
                                onEdit={(user) => {
                                    /* open edit modal */
                                }}
                                onDelete={(user) => {
                                    /* open delete confirm dialog */
                                }}
                                onChangePassword={(user) => {
                                    /* open change password modal */
                                }}
                            />
                        ))
                    )}
                </div>

                <PaginatePage
                    page={page}
                    pageSize={pageSize}
                    totalItems={filteredUsers.length}
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
        </div>
    );
};

export default SettingsView;