"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: React.ReactNode;
    cancelLabel?: string;
    variant?: "destructive" | "default";
    onConfirm: () => void | Promise<void>;
};

export default function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    cancelLabel = "Cancel",
    variant = "default",
    onConfirm,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOpenChange = (next: boolean) => {
        if (loading) return;
        if (!next) setError(null);
        onOpenChange(next);
    };

    const handleConfirm = async () => {
        setError(null);
        setLoading(true);
        try {
            await onConfirm();
            onOpenChange(false);
        } catch (err) {
            setError(
                (err as AxiosError<{ message?: string }>)?.response?.data?.message ??
                "Something went wrong. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    const destructive = variant === "destructive";

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md px-4">
                <DialogHeader className="text-left">
                    <div className="flex gap-3 items-center mb-3 ">
                        <div
                            className={cn(
                                "mb-2 flex h-10 w-10 items-center justify-center rounded-full",
                                destructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                            )}
                        >
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <DialogTitle>{title}</DialogTitle></div>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>

                {error && (
                    <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </p>
                )}

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={destructive ? "destructive" : "default"}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? "Please wait..." : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}