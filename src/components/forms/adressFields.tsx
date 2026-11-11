"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useRwandaLocations } from "@/hooks/useRwandaLocation";

export const ADDRESS_LEVELS = ["district", "sector", "cell", "village"] as const;
export type AddressLevel = (typeof ADDRESS_LEVELS)[number];
export type AddressValue = Partial<Record<AddressLevel, string>>;

const LEVEL_LABEL: Record<AddressLevel, string> = {
    district: "District / District / Akarere",
    sector: "Sector / Secteur / Umurenge",
    cell: "Cell / Cellule / Akagari",
    village: "Village / Village / Umudugudu",
};

const PLACEHOLDER: Record<AddressLevel, string> = {
    district: "Choose a district",
    sector: "Choose a sector",
    cell: "Choose a cell",
    village: "Choose a village",
};

const same = (a?: string, b?: string) => (a ?? "").trim().toLowerCase() === (b ?? "").trim().toLowerCase();

/**
 * District → Sector → Cell → Village, each list depends on the one above.
 * - levels: the address fields the service asks for. Parents above the deepest one are shown too
 * - If the list can't load, plain text boxes are shown so the customer can still finish.
 */
const AddressFields = ({
    levels,
    required = {},
    value,
    onChange,
    errors = {},
    labels = {},
    triggerClassName,
}: {
    levels: AddressLevel[];
    required?: Partial<Record<AddressLevel, boolean>>;
    value: AddressValue;
    onChange: (patch: AddressValue, changed: AddressLevel) => void;
    errors?: Partial<Record<AddressLevel, string | undefined>>;
    labels?: Partial<Record<AddressLevel, string>>;
    triggerClassName?: string;
}) => {
    const { data, isLoading, isError } = useRwandaLocations(levels.length > 0);

    const deepest = Math.max(...levels.map((l) => ADDRESS_LEVELS.indexOf(l)));
    const shown = ADDRESS_LEVELS.slice(0, deepest + 1);

    const picked = useMemo(() => {
        if (!data) return { district: null, sector: null, cell: null } as Record<string, string | null>;
        const d = data.districts.find(([, n]) => same(n, value.district));
        const s = d ? (data.sectors[d[0]] ?? []).find(([, n]) => same(n, value.sector)) : undefined;
        const c = s ? (data.cells[s[0]] ?? []).find(([, n]) => same(n, value.cell)) : undefined;
        return { district: d?.[0] ?? null, sector: s?.[0] ?? null, cell: c?.[0] ?? null };
    }, [data, value.district, value.sector, value.cell]);

    // Options for each level
    const options = useMemo(() => {
        if (!data) return {} as Record<AddressLevel, string[]>;
        return {
            district: data.districts.map(([, n]) => n),
            sector: picked.district ? (data.sectors[picked.district] ?? []).map(([, n]) => n) : [],
            cell: picked.sector ? (data.cells[picked.sector] ?? []).map(([, n]) => n) : [],
            village: picked.cell ? data.villages[picked.cell] ?? [] : [],
        } as Record<AddressLevel, string[]>;
    }, [data, picked]);

    // Changing a level empties the ones below it
    const choose = (level: AddressLevel, name: string) => {
        const i = ADDRESS_LEVELS.indexOf(level);
        const patch: AddressValue = { [level]: name };
        for (const below of ADDRESS_LEVELS.slice(i + 1)) patch[below] = "";
        onChange(patch, level);
    };

    const labelOf = (l: AddressLevel) => `${labels[l] ?? LEVEL_LABEL[l]}${required[l] ? " *" : ""}`;

    if (isLoading)
        return (
            <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading districts…
            </div>
        );

    return (
        <div className="grid gap-4 sm:grid-cols-1">
            {shown.map((level, i) => {
                const id = `address-${level}`;
                const current = value[level] ?? "";
                const parent = i > 0 ? ADDRESS_LEVELS[i - 1] : null;
                const list = options[level] ?? [];
                const match = list.find((n) => same(n, current)) ?? null;
                const waiting = !!parent && !value[parent];

                return (
                    <div key={level} className="space-y-1.5 ">
                        <label htmlFor={id} className="block text-sm font-medium opacity-80">
                            {labelOf(level)}
                        </label>

                        {isError || !data ? (
                            <Input id={id} value={current} onChange={(e) => onChange({ [level]: e.target.value }, level)} />
                        ) : (
                            <Select
                                items={list.map((n) => ({ value: n, label: n }))}
                                value={match}
                                onValueChange={(v: any) => choose(level, v ? String(v) : "")}
                                disabled={waiting || list.length === 0}
                            >
                                <SelectTrigger
                                    id={id}
                                    aria-invalid={!!errors[level]}
                                    className={cn("h-10 w-full bg-white", errors[level] && "border-red-500", triggerClassName)}
                                >
                                    <SelectValue placeholder={waiting ? `Choose the ${parent} first` : PLACEHOLDER[level]} />
                                </SelectTrigger>
                                <SelectContent className="max-h-72">
                                    {level === "district"
                                        ? // Districts grouped by province
                                        Object.entries(data?.provinces ?? {}).map(([code, province]) => (
                                            <SelectGroup key={code}>
                                                <SelectLabel>{province}</SelectLabel>
                                                {data?.districts
                                                    .filter(([, , p]) => p === code)
                                                    .map(([, n]) => (
                                                        <SelectItem key={n} value={n}>
                                                            {n}
                                                        </SelectItem>
                                                    ))}
                                            </SelectGroup>
                                        ))
                                        : list.map((n) => (
                                            <SelectItem key={n} value={n}>
                                                {n}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        )}

                        {data && current && !match && <p className="text-xs text-amber-700">Saved as “{current}”. Please choose it from the list.</p>}
                        {errors[level] && <p className="mt-1 text-xs text-red-500">{errors[level]}</p>}
                    </div>
                );
            })}
            {isError && <p className="text-xs text-muted-foreground sm:col-span-2"> Couldn&apos;t load, so you can type them instead.</p>}
        </div>
    );
};
export default AddressFields;
