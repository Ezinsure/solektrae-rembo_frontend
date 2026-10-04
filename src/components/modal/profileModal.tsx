"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import {
    ArrowLeft,
    CalendarClock,
    CalendarPlus,
    KeyRound,
    Mail,
    Phone,
    ShieldCheck,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import HttpRequest from "@/lib/httpRequest";
import PasswordInput from "../ui/passwdInput";

const CHANGE_PASSWORD_URL = "/auth/change-password";

type ProfileUser = {
    names?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
    status?: string;
    isActive?: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: ProfileUser | null | undefined;
};


function getInitials(name?: string) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function formatDate(value?: string | Date) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getStatus(user?: ProfileUser | null) {
    const raw = user?.status ?? (user?.isActive === undefined ? undefined : user.isActive ? "active" : "inactive");
    const value = raw?.toLowerCase();
    const styles: Record<string, string> = {
        active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400",
        pending: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400",
        inactive: "bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-500/10 dark:text-gray-400",
        suspended: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400",
    };
    return value ? { label: value, className: styles[value] ?? styles.inactive } : null;
}

export default function ProfileDialog({ open, onOpenChange, user }: Props) {
    const [mode, setMode] = useState<"info" | "password">("info");

    const handleOpenChange = (next: boolean) => {
        onOpenChange(next);
        if (!next) setMode("info");
    };

    const status = getStatus(user);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
                {mode === "info" ? (
                    <>
                        <div className="h-14 " />
                        <div className="px-6 pb-6">
                            <div className="-mt-11 mb-3 flex h-[88px] w-[88px] items-center justify-center rounded-full border-4 border-background bg-primary text-2xl font-semibold text-primary-foreground shadow-md">
                                {getInitials(user?.names)}
                            </div>

                            <DialogHeader className="space-y-1 text-left">
                                <DialogTitle className="text-xl">{user?.names ?? "My profile"}</DialogTitle>
                                <DialogDescription className="break-all">
                                    {user?.email ?? "Your account information"}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {user?.role && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary ring-1 ring-inset ring-primary/20">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        {user.role}
                                    </span>
                                )}
                                {status && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
                                            status.className,
                                        )}
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                        {status.label}
                                    </span>
                                )}
                            </div>


                            <div className="mt-5 divide-y rounded-xl border bg-muted/30">
                                <InfoRow icon={Mail} label="Email" value={user?.email} />
                                <InfoRow icon={Phone} label="Phone" value={user?.phoneNumber} />
                                <InfoRow icon={CalendarPlus} label="Member since" value={formatDate(user?.createdAt)} />
                                <InfoRow icon={CalendarClock} label="Last updated" value={formatDate(user?.updatedAt)} />
                            </div>
                            <Button className="mt-5 w-full gap-2" onClick={() => setMode("password")}>
                                <KeyRound className="h-4 w-4" />
                                Change password
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="p-6">
                        <ChangePasswordForm
                            onCancel={() => setMode("info")}
                            onDone={() => handleOpenChange(false)}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value?: string;
}) {
    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="truncate text-sm font-medium">{value || "—"}</p>
            </div>
        </div>
    );
}

function ChangePasswordForm({ onCancel, onDone }: { onCancel: () => void; onDone: () => void }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const validate = () => {
        if (newPassword.length < 8) return "New password must be at least 8 characters.";
        if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword))
            return "New password must contain letters and numbers.";
        if (newPassword === currentPassword) return "New password must be different from the current one.";
        return null;
    };
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const problem = validate();
        if (problem) return setError(problem);

        setError(null);
        setLoading(true);
        try {
            await HttpRequest.patch(CHANGE_PASSWORD_URL, { currentPassword, newPassword });
            setSuccess(true);
            setTimeout(onDone, 1500);
        } catch (err) {
            const message =
                (err as AxiosError<{ message?: string }>)?.response?.data?.message ??
                "Could not change password. Please try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} noValidate>
            <DialogHeader className="text-left">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <KeyRound className="h-5 w-5" />
                </div>
                <DialogTitle>Change password</DialogTitle>
                <DialogDescription>Use at least 8 characters with letters , capitals and numbers.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-5">
                <div className="grid gap-2">
                    <Label htmlFor="currentPassword">Current password</Label>
                    <PasswordInput id="currentPassword" type="password" autoComplete="current-password"
                        value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <PasswordInput id="newPassword" type="password" autoComplete="new-password"
                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                {error && (
                    <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </p>
                )}
                {success && (
                    <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        Password updated successfully.
                    </p>
                )}
            </div>

            <div className="flex justify-between gap-2">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={loading} className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <Button type="submit" disabled={loading || success}>
                    {loading ? "Saving..." : "Update password"}
                </Button>
            </div>
        </form>
    );
}