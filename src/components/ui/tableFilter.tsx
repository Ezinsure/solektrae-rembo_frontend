"use client";

import { SearchInput } from "@/components/ui/reusableSearch";
import { SelectFilter, type SelectFilterOption } from "@/components/ui/reusableFilter";

export function TableFilters({
    search,
    onSearchChange,
    searchPlaceholder,
    filters = [],
}: {
    search: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    filters?: {
        value: string;
        onChange: (value: string) => void;
        options: SelectFilterOption[];
        placeholder?: string;
    }[];
}) {
    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ">
            <SearchInput
                value={search}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
            />
            <div className="flex flex-col sm:flex-row gap-3">
                {filters.map((filter, i) => (
                    <SelectFilter
                        key={i}
                        value={filter.value}
                        onChange={filter.onChange}
                        options={filter.options}
                        placeholder={filter.placeholder}
                    />
                ))}
            </div>
        </div>
    );
}