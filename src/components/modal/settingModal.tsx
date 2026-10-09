"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Modal({
    open, onClose, title, description, children, size = "md",
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    size?: "md" | "lg";
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 px-0 md:px-3 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-gray-900/40" />
            <div className={cn("relative flex max-h-[92vh] w-full flex-col rounded-xl bg-white shadow-xl sm:rounded-xl", size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg")}>
                <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
                    <div>
                        <h2 id="modal-title" className="text-base font-semibold text-gray-900">{title}</h2>
                        {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
    return <div className="sticky bottom-0 flex justify-end gap-2  bg-white px-5 py-4 sm:px-6">{children}</div>;
}

export function ConfirmModal({
    open, onClose, onConfirm, title, message, confirmLabel = "Delete",
}: {
    open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: React.ReactNode; confirmLabel?: string;
}) {
    return (
        <Modal open={open} onClose={onClose} title={title}>
            <p className="px-5 py-5 text-sm text-gray-600 sm:px-6">{message}</p>
            <ModalFooter>
                <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                <button type="button" onClick={() => { onConfirm(); onClose(); }} className="btn-danger">{confirmLabel}</button>
            </ModalFooter>
        </Modal>
    );
}