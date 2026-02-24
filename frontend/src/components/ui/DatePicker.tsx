import * as React from "react";
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface DatePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    placeholder?: string;
    maxDate?: Date;
    minDate?: Date;
    className?: string;
    onPrevDay?: () => void;
    onNextDay?: () => void;
    disablePrev?: boolean;
    disableNext?: boolean;
}

export function DatePicker({
    date,
    setDate,
    placeholder = "Pick a date",
    maxDate,
    minDate,
    className,
    onPrevDay,
    onNextDay,
    disablePrev,
    disableNext
}: DatePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [currentMonth, setCurrentMonth] = React.useState(date || new Date());
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

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getDay(startOfMonth(currentMonth));
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const handleSelectDate = (day: number) => {
        const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (maxDate && selected > maxDate) return;
        if (minDate && selected < minDate) return;
        setDate(selected);
        setIsOpen(false);
    };

    const isToday = (day: number) => {
        return isSameDay(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), new Date());
    };

    const isSelected = (day: number) => {
        if (!date) return false;
        return isSameDay(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), date);
    };

    const isDisabled = (day: number) => {
        const tgt = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (maxDate && tgt > maxDate) return true;
        if (minDate && tgt < minDate) return true;
        return false;
    };

    return (
        <div className={cn("relative flex items-center w-full", className)} ref={containerRef}>
            {onPrevDay && (
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); onPrevDay(); }}
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
                    !onPrevDay && "rounded-l-md",
                    !onNextDay && "rounded-r-md",
                    !date && "text-slate-500 dark:text-slate-400"
                )}
            >
                <span className="truncate mr-2">{date ? format(date, "PPP") : placeholder}</span>
                <CalendarIcon className="h-4 w-4 opacity-50 shrink-0" />
            </button>
            {onNextDay && (
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); onNextDay(); }}
                    disabled={disableNext}
                    className="flex-shrink-0 h-9 px-2 rounded-r-md border border-l-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            )}

            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 w-[280px] rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 shadow-md animate-in fade-in zoom-in-95 duration-200 origin-top">
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                            {format(currentMonth, "MMMM yyyy")}
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-[0.65rem] font-medium text-slate-500 uppercase">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {blanks.map(blank => (
                            <div key={`blank-${blank}`} className="h-8 w-8" />
                        ))}
                        {days.map(day => {
                            const disabled = isDisabled(day);
                            return (
                                <button
                                    key={day}
                                    onClick={() => handleSelectDate(day)}
                                    disabled={disabled}
                                    className={cn(
                                        "h-8 w-8 rounded-md text-sm flex items-center justify-center transition-colors",
                                        isSelected(day)
                                            ? "bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900 font-medium shadow-sm hover:opacity-90"
                                            : disabled
                                                ? "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                                        isToday(day) && !isSelected(day) && "bg-slate-50 dark:bg-slate-900 font-medium border border-slate-200 dark:border-slate-800"
                                    )}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
