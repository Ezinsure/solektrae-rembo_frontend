"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DateRangePicker({
    value,
    onChange,
    className,
}: {
    value: DateRange | undefined;
    onChange: (range: DateRange | undefined) => void;
    className?: string;
}) {
    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button
                        variant="outline"
                        className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !value && "text-muted-foreground",
                            className
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value?.from ? (
                            value.to ? (
                                <>
                                    {format(value.from, "LLL dd, y")} –{" "}
                                    {format(value.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(value.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                }
            />
            <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                    mode="range"
                    defaultMonth={value?.from}
                    selected={value}
                    onSelect={onChange}
                    numberOfMonths={2}
                />
                {value && (
                    <div className="flex justify-end p-2 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onChange(undefined)}
                        >
                            Clear
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}