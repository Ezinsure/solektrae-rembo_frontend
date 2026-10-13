"use client";

import { MoreVertical, Eye, Pencil, Trash2, KeyRound,CalendarDays, ShieldCheck, Smartphone, AtSign } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
            "group relative flex flex-col overflow-hidden rounded-xl border bg-white transition-all hover:-translate-y-0.5 hover:shadow-md",
            !user.isActive && "bg-gray-50/60",
        )}
    >
        <div className="flex items-start gap-3 p-5 pb-4">
            <div className="relative shrink-0">
                <Avatar className="h-11 w-11 ring-2 ring-white">
                    {user.profileImage && <AvatarImage src={user.profileImage} alt={user.names} />}
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                        {getInitials(user.names)}
                    </AvatarFallback>
                </Avatar>
                <span
                    className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white",
                        user.isActive ? "bg-emerald-500" : "bg-gray-300",
                    )}
                    aria-hidden
                />
            </div>

            <button type="button" onClick={() => onView(user)} className="min-w-0 flex-1 text-left">
                <h3 className={cn("truncate font-semibold leading-tight", user.isActive ? "text-gray-900" : "text-gray-500")}>
                    {user.names}
                </h3>
                <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    <ShieldCheck className="h-3 w-3" />
                    {user.roleName ?? user.role}
                </p>
            </button>

            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="ghost"
                            size="icon"
                            className="-mr-2 -mt-1 h-8 w-8 text-gray-400 opacity-70 transition-opacity hover:text-gray-700 group-hover:opacity-100"
                            aria-label={`Actions for ${user.names}`}
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    }
                />
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onView(user)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onChangePassword(user)}>
                            <KeyRound className="mr-2 h-4 w-4" /> Change password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(user)} className="text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <dl className="space-y-2 px-5 pb-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
                <AtSign  className="h-4 w-4 shrink-0 text-gray-400" />
                <dt className="sr-only">Email</dt>
                <dd className="truncate">
                    <a href={`mailto:${user.email}`} className="hover:text-primary hover:underline">{user.email}</a>
                </dd>
            </div>
            {user.phoneNumber && (
                <div className="flex items-center gap-2 text-gray-600">
                    <Smartphone  className="h-4 w-4 shrink-0 text-gray-400" />
                    <dt className="sr-only">Phone</dt>
                    <dd className="truncate">
                        <a href={`tel:${user.phoneNumber}`} className="hover:text-primary hover:underline">{user.phoneNumber}</a>
                    </dd>
                </div>
            )}
        </dl>
        <div className="mt-auto flex items-center justify-between gap-3 border-t bg-gray-50/70 px-5 py-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                Joined{" "}
                {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <StatusBadge status={statusKey} />
        </div>
    </div>
    );
}