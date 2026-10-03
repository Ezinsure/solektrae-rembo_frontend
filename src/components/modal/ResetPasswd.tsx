"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { KeyRound, Mail } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import HttpRequest from "@/lib/httpRequest";
import PasswordInput from "../ui/passwdInput";

const resetPasswordUrl = (id: string) => `/users/${id}/reset-password`;
const sendResetLinkUrl = (id: string) => `/users/${id}/send-reset-link`;

// Set to true once the email reset link endpoint is live on the backend
const RESET_LINK_ENABLED = false;

type Mode = "set" | "link";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: { id: string; names?: string; email?: string } | null;
};

const getMessage = (err: unknown, fallback: string) =>
    (err as AxiosError<{ message?: string }>)?.response?.data?.message ?? fallback;

export default function AdminPasswordDialog({ open, onOpenChange, user }: Props) {
    const [mode, setMode] = useState<Mode>("set");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const reset = () => {
        setMode("set");
        setPassword("");
        setError(null);
        setSuccess(null);
    };

    const handleOpenChange = (next: boolean) => {
        if (loading) return;
        if (!next) reset();
        onOpenChange(next);
    };

    const finish = (message: string) => {
        setSuccess(message);
        setTimeout(() => handleOpenChange(false), 1500);
    };

    const setNewPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            await HttpRequest.patch(resetPasswordUrl(user.id), { newPassword: password });
            finish("Password updated.");
        } catch (err) {
            setError(getMessage(err, "Could not update the password. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    const sendLink = async () => {
        if (!user) return;
        setError(null);
        setLoading(true);
        try {
            await HttpRequest.post(sendResetLinkUrl(user.id));
            finish(`Reset link sent to ${user.email ?? "the user's email"}.`);
        } catch (err) {
            setError(getMessage(err, "Could not send the reset link. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-left">
                    <div className="flex gap-3 items-center ">
                        <div className=" flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <KeyRound className="h-5 w-5" />
                        </div>
                        <DialogTitle>Reset password</DialogTitle></div>
                    <DialogDescription>
                        {user?.names ? <>For <span className="font-medium text-foreground">{user.names}</span>. </> : null}
                        Choose how to reset their password.
                    </DialogDescription>
                </DialogHeader>


                <div role="radiogroup" aria-label="Reset method" className="grid grid-cols-2 gap-2">
                    <OptionCard
                        selected={mode === "set"}
                        onSelect={() => { setMode("set"); setError(null); }}
                        icon={KeyRound}
                        title="Set password"
                        text="You choose a  password"
                    />
                    <OptionCard
                        selected={mode === "link"}
                        onSelect={() => { setMode("link"); setError(null); }}
                        icon={Mail}
                        title="Send link"
                        text="User sets their own by email"
                        badge={RESET_LINK_ENABLED ? undefined : "Soon"}
                    />
                </div>

                {mode === "set" ? (
                    <form onSubmit={setNewPassword} noValidate className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="adminNewPassword">New password</Label>
                            <PasswordInput id="adminNewPassword" autoComplete="new-password"
                                value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <Messages error={error} success={success} />

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading || !!success}>
                                {loading ? "Saving..." : "Update password"}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="grid gap-4">
                        <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                            <p className="text-muted-foreground">A secure link will be sent to:</p>
                            <p className="mt-1 font-medium break-all">{user?.email ?? "—"}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                The link expires after 1 hour and can be used once. You never see their password.
                            </p>
                        </div>

                        {!RESET_LINK_ENABLED && (
                            <p className="text-xs text-muted-foreground">This option will be available soon.</p>
                        )}

                        <Messages error={error} success={success} />

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button onClick={sendLink} disabled={!RESET_LINK_ENABLED || loading || !!success}>
                                {loading ? "Sending..." : "Send reset link"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function OptionCard({
    selected,
    onSelect,
    icon: Icon,
    title,
    text,
    badge,
}: {
    selected: boolean;
    onSelect: () => void;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    text: string;
    badge?: string;
}) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={onSelect}
            className={cn(
                "relative flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50",
            )}
        >
            {badge && (
                <span className="absolute right-2 top-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {badge}
                </span>
            )}
            <Icon className={cn("h-4 w-4", selected ? "text-primary" : "text-muted-foreground")} />
            <span className="text-sm font-medium">{title}</span>
            <span className="text-xs text-muted-foreground">{text}</span>
        </button>
    );
}

function Messages({ error, success }: { error: string | null; success: string | null }) {
    if (error)
        return <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>;
    if (success)
        return (
            <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                {success}
            </p>
        );
    return null;
}