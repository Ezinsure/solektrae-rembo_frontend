"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, CircleAlert, Loader2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "danger";

const VARIANTS: Record<Variant, { icon: any; media: string; button: string }> = {
    default: {
        icon: CircleAlert,
        media: "bg-primary/10 text-primary",
        button: "",
    },
    success: {
        icon: CheckCircle2,
        media: "bg-emerald-100 text-emerald-600",
        button: "bg-emerald-600 text-white hover:bg-emerald-700",
    },
    danger: {
        icon: TriangleAlert,
        media: "bg-red-100 text-red-600",
        button: "bg-red-600 text-white hover:bg-red-700",
    },
};

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    onConfirm,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    loadingLabel = "Saving…",
    variant = "default",
    isLoading = false,
    confirmDisabled = false,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: React.ReactNode;
    children?: React.ReactNode;
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    loadingLabel?: string;
    variant?: Variant;
    isLoading?: boolean;
    confirmDisabled?: boolean;
}) {
    const v = VARIANTS[variant];
    const Icon = v.icon;

    return (
        <AlertDialog open={open} onOpenChange={(o) => !isLoading && onOpenChange(o)}>
            <AlertDialogContent className="w-[calc(100%-2rem)] max-w-2xl! p-6!">
                <AlertDialogHeader>
                    <AlertDialogMedia className={cn("rounded-full", v.media)}>
                        <Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description && (
                        <AlertDialogDescription render={<div />} className="text-sm text-muted-foreground">
                            {description}
                        </AlertDialogDescription>
                    )}
                </AlertDialogHeader>

                {children && <div className="space-y-2">{children}</div>}

                <div>

                </div>
                <div className="mt-2 flex flex-col-reverse gap-2 bg-white sm:flex-row sm:justify-end">
                    <AlertDialogCancel disabled={isLoading}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        className={v.button}
                        disabled={isLoading || confirmDisabled}
                        onClick={(e) => {
                            e.preventDefault(); // keep open until the request finishes
                            onConfirm();
                        }}
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isLoading ? loadingLabel : confirmLabel}
                    </AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}