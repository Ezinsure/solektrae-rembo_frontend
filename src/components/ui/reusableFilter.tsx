"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface SelectFilterOption {
    label: string;
    value: string;
}

export function SelectFilter({
    value,
    onChange,
    options,
    placeholder = "Filter",
    className,
}: {
    value: string;
    onChange: (value: string) => void;
    options: SelectFilterOption[];
    placeholder?: string;
    className?: string;
}) {
    return (
        <Select value={value} onValueChange={(v) => onChange(v ?? "all")}>
            <SelectTrigger className={className ?? "w-full sm:w-[180px]"}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}