"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import { MonthPicker } from "@/components/ui/MonthPicker";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ReportPage() {
    const { user, loading } = useAuth();
    const [reportData, setReportData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Default to current month YYYY-MM
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

    const handlePrevMonth = () => {
        if (!selectedMonth) return;
        const [y, m] = selectedMonth.split("-").map(Number);
        const prev = new Date(y, m - 2, 1);
        setSelectedMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`);
    };

    const handleNextMonth = () => {
        if (!selectedMonth) return;
        const [y, m] = selectedMonth.split("-").map(Number);
        const next = new Date(y, m, 1);
        const newMonthStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
        if (newMonthStr <= currentMonthStr) {
            setSelectedMonth(newMonthStr);
        }
    };

    const loadReport = async (month: string) => {
        try {
            setIsLoading(true);
            const { data } = await api.get(`/teacher/attendanceDetails?month=${month}`);
            setReportData(data.students);
        } catch (err) {
            toast.error("Failed to load monthly report.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === "TEACHER") {
            loadReport(selectedMonth);
        }
    }, [user, selectedMonth]);

    const handlePrint = () => {
        window.print();
    };

    if (loading || !user) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-3xl font-display font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                        Monthly Reports
                    </h1>
                    <p className="text-slate-500 mt-1">Review detailed attendance analytics for any given month.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    <div className="w-full md:w-[240px] z-10">
                        <MonthPicker
                            value={selectedMonth}
                            onChange={setSelectedMonth}
                            maxDate={currentMonthStr}
                            onPrevMonth={handlePrevMonth}
                            onNextMonth={handleNextMonth}
                            disableNext={selectedMonth >= currentMonthStr}
                        />
                    </div>
                    <Button onClick={handlePrint} variant="outline" disabled={isLoading || reportData.length === 0} className="w-full sm:w-auto">
                        Print / Export PDF
                    </Button>
                </div>
            </header>

            {/* Print Header that only shows when printing */}
            <div className="hidden print:block mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Monthly Attendance Report - {user.subject}</h1>
                <p className="text-slate-600 dark:text-slate-400">Month: {new Date(selectedMonth + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                <p className="text-slate-600 dark:text-slate-400">Generated: {new Date().toLocaleDateString()}</p>
            </div>

            <Card className="print:shadow-none print:border-none">
                <CardHeader className="print:hidden">
                    <CardTitle>Analytics Data</CardTitle>
                    <CardDescription>Breakdown of attendance statistics per student.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-8 text-center text-slate-500 print:hidden">Generating report...</div>
                    ) : reportData.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 print:hidden">No data recorded for this month.</div>
                    ) : (
                        <div className="overflow-x-auto print:overflow-visible">
                            <table className="w-full min-w-[700px] print:min-w-0 text-sm text-left border-collapse">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Roll No.</th>
                                        <th className="px-6 py-3 font-medium">Name</th>
                                        <th className="px-4 py-3 font-medium text-center print:border print:border-slate-300">Total Classes</th>
                                        <th className="px-4 py-3 font-medium text-center print:border print:border-slate-300">Present</th>
                                        <th className="px-4 py-3 font-medium text-center print:border print:border-slate-300">Absent</th>
                                        <th className="px-4 py-3 font-medium text-center print:border print:border-slate-300">Late / Leave</th>
                                        <th className="px-6 py-3 font-medium text-right print:border print:border-slate-300">Attendance %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((student) => (
                                        <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-50 print:border print:border-slate-300">
                                                {student.roll_num}
                                            </td>
                                            <td className="px-6 py-4 print:border print:border-slate-300">
                                                {student.name}
                                            </td>
                                            <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-400 print:border print:border-slate-300">
                                                {student.total_classes}
                                            </td>
                                            <td className="px-4 py-4 text-center text-emerald-600 dark:text-emerald-500 font-medium print:border print:border-slate-300">
                                                {student.present_count}
                                            </td>
                                            <td className="px-4 py-4 text-center text-rose-600 dark:text-rose-500 font-medium print:border print:border-slate-300">
                                                {student.absent_count}
                                            </td>
                                            <td className="px-4 py-4 text-center text-amber-600 dark:text-amber-500 print:border print:border-slate-300">
                                                {student.late_count} / {student.leave_count}
                                            </td>
                                            <td className="px-6 py-4 text-right print:border print:border-slate-300">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.attendance_percentage >= 75
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 print:bg-transparent print:text-black'
                                                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 print:bg-transparent print:text-black'
                                                    }`}>
                                                    {student.attendance_percentage}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
