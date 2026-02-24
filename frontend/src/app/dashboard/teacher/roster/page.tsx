"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function RosterPage() {
    const { user, loading } = useAuth();
    const [roster, setRoster] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadRoster = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/teacher/attendanceDetails");
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
    }, [user]);

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name} from your class? This action cannot be undone.`)) return;

        try {
            await api.delete(`/teacher/deleteStudent/${id}`);
            toast.success(`${name} was successfully removed.`);
            loadRoster();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to remove student");
        }
    };

    if (loading || !user) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <header className="mb-8">
                <h1 className="text-3xl font-display font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    Class Roster
                </h1>
                <p className="text-slate-500 mt-1">Manage all students currently enrolled in your subject.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Enrolled Students</CardTitle>
                    <CardDescription>A complete list of students and their overall attendance rate.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-8 text-center text-slate-500">Loading roster...</div>
                    ) : roster.length === 0 ? (
                        <div className="py-8 text-center text-slate-500">No students enrolled yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px] text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Roll No.</th>
                                        <th className="px-6 py-3 font-medium">Name</th>
                                        <th className="px-6 py-3 font-medium">Email</th>
                                        <th className="px-6 py-3 font-medium text-center">Attendance %</th>
                                        <th className="px-6 py-3 font-medium text-right">Actions</th>
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
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                                {student.email}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.attendance_percentage >= 75
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                                                    }`}>
                                                    {student.attendance_percentage}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/50 h-8 px-3"
                                                    onClick={() => handleDelete(student.id, student.name)}
                                                >
                                                    Remove
                                                </Button>
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
