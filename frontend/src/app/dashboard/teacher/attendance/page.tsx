"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/DatePicker";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AttendancePage() {
    const { user, loading } = useAuth();
    const [roster, setRoster] = useState<any[]>([]);
    const [attendanceState, setAttendanceState] = useState<Record<number, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Default to today
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Functions to handle string <-> Date conversion for the API
    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        // Format to YYYY-MM-DD
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        setSelectedDate(localDate.toISOString().split('T')[0]);
    };

    const handlePrevDay = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - 1);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const handleNextDay = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + 1);
        const newDateStr = date.toISOString().split('T')[0];
        const todayStr = new Date().toISOString().split('T')[0];
        if (newDateStr <= todayStr) {
            setSelectedDate(newDateStr);
        }
    };

    const loadRoster = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get(`/teacher/dailyAttendance?date=${selectedDate}`);

            // If a student has an existing status for this date, use it. Otherwise, default to PRESENT.
            const currentState: Record<number, string> = {};
            data.students.forEach((s: any) => {
                currentState[s.id] = s.status ? s.status : "PRESENT";
            });
            setAttendanceState(currentState);
            setRoster(data.students);
        } catch (err) {
            toast.error("Failed to load class roster.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === "TEACHER") {
            loadRoster();
        }
    }, [user, selectedDate]);

    const handleMarkStatus = (studentId: number, status: string) => {
        setAttendanceState(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const records = Object.entries(attendanceState).map(([studentId, status]) => ({
                student_id: parseInt(studentId, 10),
                status
            }));

            const { data } = await api.post("/teacher/markAttendance", {
                date: selectedDate,
                records
            });

            toast.success(`Successfully marked attendance for ${data.summary.marked} students.`);
            // Reset to defaults to prevent accidental duplicate submits for that day
            loadRoster();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to submit attendance");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !user) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                        Mark Attendance
                    </h1>
                    <p className="text-slate-500 mt-1">Quickly assign daily statuses to your entire class.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    <div className="w-full md:w-[240px]">
                        <DatePicker
                            date={new Date(selectedDate)}
                            setDate={handleDateSelect}
                            maxDate={new Date()}
                            onPrevDay={handlePrevDay}
                            onNextDay={handleNextDay}
                            disableNext={selectedDate >= new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <Button onClick={handleSubmit} disabled={isSubmitting || roster.length === 0} className="w-full sm:w-auto">
                        {isSubmitting ? "Submitting..." : "Submit Records"}
                    </Button>
                </div>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Class Roster</CardTitle>
                    <CardDescription>Select the status for each student. All unselected will default to Present.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-8 text-center text-slate-500">Loading roster...</div>
                    ) : roster.length === 0 ? (
                        <div className="py-8 text-center text-slate-500">No students enrolled to mark.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px] text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Roll No.</th>
                                        <th className="px-6 py-3 font-medium">Name</th>
                                        <th className="px-6 py-3 font-medium text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roster.map((student) => (
                                        <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-50">
                                                {student.roll_num}
                                            </td>
                                            <td className="px-6 py-4">
                                                {student.name}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {['PRESENT', 'ABSENT', 'LATE', 'LEAVE'].map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleMarkStatus(student.id, status)}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-md text-xs font-semibold transition-all border",
                                                                attendanceState[student.id] === status
                                                                    ? status === 'PRESENT' ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shadow-sm" :
                                                                        status === 'ABSENT' ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 shadow-sm" :
                                                                            status === 'LATE' ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 shadow-sm" :
                                                                                "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 shadow-sm"
                                                                    : "bg-transparent text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-600 dark:hover:text-slate-400"
                                                            )}
                                                        >
                                                            {status.slice(0, 1) + status.slice(1).toLowerCase()}
                                                        </button>
                                                    ))}
                                                </div>
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
