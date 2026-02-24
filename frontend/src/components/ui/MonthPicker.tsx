import * as React from "react";
import { format, addYears, subYears } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface MonthPickerProps {
    value: string; // Format: YYYY-MM
    onChange: (value: string) => void;
    maxDate?: string; // Format: YYYY-MM
    minDate?: string;
    className?: string;
    onPrevMonth?: () => void;
    onNextMonth?: () => void;
    disablePrev?: boolean;
    disableNext?: boolean;
}

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function MonthPicker({
    value,
    onChange,
    maxDate,
    minDate,
    className,
    onPrevMonth,
    onNextMonth,
    disablePrev,
    disableNext
}: MonthPickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    const [y, m] = value.split("-").map(Number);
    const [viewYear, setViewYear] = React.useState(y || new Date().getFullYear());

    const containerRef = React.useRef<HTMLDivElement>(null);

    // Close on click outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePrevYear = () => setViewYear(prev => prev - 1);
    const handleNextYear = () => setViewYear(prev => prev + 1);

    const handleSelectMonth = (monthIndex: number) => {
        const monthStr = String(monthIndex + 1).padStart(2, '0');
        const selected = `${viewYear}-${monthStr}`;
        if (maxDate && selected > maxDate) return;
        if (minDate && selected < minDate) return;
        onChange(selected);
        setIsOpen(false);
    };

    const isSelected = (monthIndex: number) => {
        const tgt = `${viewYear}-${String(monthIndex + 1).padStart(2, '0')}`;
        return tgt === value;
    };

    const isDisabled = (monthIndex: number) => {
        const tgt = `${viewYear}-${String(monthIndex + 1).padStart(2, '0')}`;
        if (maxDate && tgt > maxDate) return true;
        if (minDate && tgt < minDate) return true;
        return false;
    };

    const [valY, valM] = value.split("-").map(Number);
    const dateObj = new Date(valY, valM - 1, 1);

    return (
        <div className={cn("relative flex items-center w-full", className)} ref={containerRef}>
            {onPrevMonth && (
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); onPrevMonth(); }}
                    disabled={disablePrev}
                    className="flex-shrink-0 h-9 px-2 rounded-l-md border border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-9 w-full items-center justify-between border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                    !onPrevMonth && "rounded-l-md",
                    !onNextMonth && "rounded-r-md",
                    !value && "text-slate-500 dark:text-slate-400"
                )}
            >
                <span className="truncate mr-2">{value ? format(dateObj, "MMMM yyyy") : "Pick a month"}</span>
                <CalendarIcon className="h-4 w-4 opacity-50 shrink-0" />
            </button>
            {onNextMonth && (
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); onNextMonth(); }}
                    disabled={disableNext}
                    className="flex-shrink-0 h-9 px-2 rounded-r-md border border-l-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            )}

            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 w-[260px] rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 shadow-md animate-in fade-in zoom-in-95 duration-200 origin-top">
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrevYear}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                            {viewYear}
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNextYear}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {MONTHS.map((tempMapMonth, index) => {
                            const disabled = isDisabled(index);
                            return (
                                <button
                                    key={tempMapMonth}
                                    onClick={() => handleSelectMonth(index)}
                                    disabled={disabled}
                                    className={cn(
                                        "h-10 rounded-md text-sm font-medium flex items-center justify-center transition-colors",
                                        isSelected(index)
                                            ? "bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900 shadow-sm hover:opacity-90"
                                            : disabled
                                                ? "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    )}
                                >
                                    {tempMapMonth}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
