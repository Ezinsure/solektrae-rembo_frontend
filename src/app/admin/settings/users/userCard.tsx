"use client";

import { MoreVertical, Eye, Pencil, Trash2, KeyRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/common/statusBadge";
import { getInitials } from "@/helper";


export function UserCard({
    user,
    onView,
    onEdit,
    onDelete,
    onChangePassword,
}: {
    user: any;
    onView: (user: any) => void;
    onEdit: (user: any) => void;
    onDelete: (user: any) => void;
    onChangePassword: (user: any) => void;
}) {
    const statusKey = user.isActive ? "active" : "inactive";

    return (
        <div
            className={cn(
                "group relative rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md border-l-4",
                user.isActive ? "border-l-primary" : "border-l-gray-300"
            )}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                            {getInitials(user.names)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold leading-tight">{user.names}</h3>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-60 group-hover:opacity-100"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        }
                    />
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onView(user)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(user)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onChangePassword(user)}>
                                <KeyRound className="h-4 w-4 mr-2" />
                                Change Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete(user)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem></DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="mt-8 flex items-center justify-between">
                <Badge variant="secondary" className="capitalize font-normal">
                    {user.role}
                </Badge>
                <StatusBadge status={statusKey} />
            </div>

            {user.phoneNumber && (
                <p className="mt-3 text-sm text-muted-foreground">
                    {user.phoneNumber}
                </p>
            )}
        </div>
    );
}