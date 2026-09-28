import { DateRange } from "react-day-picker";

export function filterByDateRange<T extends { createdAt: string }>(
    items: T[],
    range: DateRange | undefined
): T[] {
    if (!range?.from) return items;

    const from = new Date(range.from);
    from.setHours(0, 0, 0, 0);

    const to = range.to ? new Date(range.to) : new Date(range.from);
    to.setHours(23, 59, 59, 999);

    return items.filter((item) => {
        const created = new Date(item.createdAt);
        return created >= from && created <= to;
    });
}