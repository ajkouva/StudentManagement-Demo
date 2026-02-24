"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MonthPicker } from "@/components/ui/MonthPicker";

export default function StudentDashboard() {
    const { user, loading, logoutUser } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<any>(null);
    const [summary, setSummary] = useState<any>(null);
    const [calendar, setCalendar] = useState<any[]>([]);

    // Default to current month on initial state
    const today = new Date();
    const initialMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const [currentMonth, setCurrentMonth] = useState(initialMonthStr);

    const handlePrevMonth = () => {
        if (!currentMonth) return;
        const [y, m] = currentMonth.split("-").map(Number);
        const prev = new Date(y, m - 2, 1);
        setCurrentMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`);
    };

    const handleNextMonth = () => {
        if (!currentMonth) return;
        const [y, m] = currentMonth.split("-").map(Number);
        const next = new Date(y, m, 1);
        const newMonthStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
        if (newMonthStr <= initialMonthStr) {
            setCurrentMonth(newMonthStr);
        }
    };

    useEffect(() => {
        if (!loading && !user) router.push("/");
        if (user && user.role !== "STUDENT") router.push("/dashboard/teacher");
    }, [user, loading, router]);

    // Fetching data that depends on the selected month
    useEffect(() => {
        if (!user || user.role !== "STUDENT" || !currentMonth) return;

        const fetchDashboardData = async () => {
            try {
                const [detailsRes, calendarRes] = await Promise.all([
                    api.get("/student/studentDetails"),
                    // We can also pass month to calendar API
                    api.post("/student/attendanceCalendar", { month: currentMonth }),
                ]);

                setProfile(detailsRes.data.profile);

                // We need to calculate summary based on the selected month.
                // If the backend `studentDetails` only ever returns current_month,
                // we should calculate summary from the calendar locally to be safe for past months.
                const calData = calendarRes.data.calendar || [];
                setCalendar(calData);

                const present = calData.filter((r: any) => r.status === "PRESENT").length;
                const total = calData.length;
                const p = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

                setSummary({
                    present_count: present,
                    total_classes: total,
                    attendance_percentage: p
                });

            } catch (err) {
                console.error("Failed to load dashboard data", err);
            }
        };

        fetchDashboardData();
    }, [user, currentMonth]);

    // Helper to generate a fast, simple calendar grid
    const renderCalendar = useMemo(() => {
        if (!currentMonth) return null;

        const [year, month] = currentMonth.split("-").map(Number);
        // Note: JS months are 0-indexed
        const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
        const daysInMonth = new Date(year, month, 0).getDate();

        const grid = [];

        // Add empty cells for days before the 1st of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            grid.push(<div key={`empty-${i}`} className="p-2 border border-transparent"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const record = calendar.find(c => c.date === dateStr);
            const dayOfWeek = new Date(year, month - 1, i).getDay();
            const isSunday = dayOfWeek === 0;

            let statusColor = isSunday ? "bg-slate-100/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-60" : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600";
            if (record?.status === "PRESENT") statusColor = "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-medium shadow-sm";
            if (record?.status === "ABSENT") statusColor = "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 font-medium shadow-sm";
            if (record?.status === "LATE") statusColor = "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-medium shadow-sm";
            if (record?.status === "LEAVE") statusColor = "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-medium shadow-sm";

            grid.push(
                <div key={i} className={`flex flex-col items-center justify-center p-2 rounded-md border ${statusColor} text-sm transition-all hover:scale-105 cursor-default`}>
                    <span className={isSunday && !record ? 'text-red-400 font-medium' : ''}>{i}</span>
                    {record && <span className="text-[10px] uppercase tracking-wider mt-1">{record.status.slice(0, 1)}</span>}
                    {!record && isSunday && <span className="text-[9px] uppercase tracking-wider mt-1 text-red-400/70">OFF</span>}
                </div>
            )
        }
        return grid;
    }, [calendar, currentMonth]);

    if (loading || !user) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-display font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    Student Portal
                </h1>
                <p className="text-slate-500 mt-1">
                    {profile ? `${profile.name} • ${profile.subject} • Roll ${profile.roll_num}` : "Loading profile..."}
                </p>
            </header>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Target Month</CardDescription>
                        <div className="pt-2 w-full">
                            <MonthPicker
                                value={currentMonth}
                                onChange={setCurrentMonth}
                                maxDate={initialMonthStr}
                                onPrevMonth={handlePrevMonth}
                                onNextMonth={handleNextMonth}
                                disableNext={currentMonth >= initialMonthStr}
                            />
                        </div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Classes Attended</CardDescription>
                        <CardTitle className="text-4xl font-display text-emerald-600 dark:text-emerald-500">
                            {summary ? `${summary.present_count} / ${summary.total_classes}` : "-"}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Attendance Rate</CardDescription>
                        <CardTitle className="text-4xl font-display">
                            {summary ? `${summary.attendance_percentage}%` : "-"}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Attendance Calendar</CardTitle>
                    <CardDescription>Your daily attendance record for the current month.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-2 sm:gap-4 mt-4">
                        {/* Weekday Headers */}
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={i} className="text-center text-xs font-semibold text-slate-500 pb-2">{d}</div>
                        ))}

                        {/* Calendar Grid */}
                        {renderCalendar}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
