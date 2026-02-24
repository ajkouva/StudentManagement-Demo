"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import toast from "react-hot-toast";
import Link from "next/link";

export default function TeacherDashboard() {
    const { user, loading, logoutUser } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState<any>(null);
    const [newStudent, setNewStudent] = useState({ name: "", email: "", password: "", roll_num: "", subject: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && !user) router.push("/");
        if (user && user.role !== "TEACHER") router.push("/dashboard/student");
    }, [user, loading, router]);

    const loadStats = async () => {
        try {
            const { data } = await api.get("/teacher/stats");
            setStats(data);
            setNewStudent(prev => ({ ...prev, subject: data.subject || "" }));
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (user && user.role === "TEACHER") loadStats();
    }, [user]);

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post("/teacher/addStudent", {
                ...newStudent,
                roll_num: parseInt(newStudent.roll_num, 10)
            });
            toast.success("Student added successfully!");
            setNewStudent({ name: "", email: "", password: "", roll_num: "", subject: stats?.subject || "" });
            loadStats(); // refresh stats to show new total
        } catch (err: any) {
            if (err.response?.data?.errors) {
                toast.error(err.response.data.errors[0].message);
            } else {
                toast.error(err.response?.data?.message || "Failed to add student");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !user) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-display font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    Welcome, {user.name}
                </h1>
                <p className="text-slate-500 mt-1">Manage your classes and track student attendance.</p>
            </header>

            {/* Metrics Row */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Students</CardDescription>
                        <CardTitle className="text-4xl font-display">
                            {stats ? stats.total_student : "-"}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Present Today</CardDescription>
                        <CardTitle className="text-4xl font-display text-emerald-600 dark:text-emerald-500">
                            {stats && stats.today ? stats.today.present : "-"}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Absent Today</CardDescription>
                        <CardTitle className="text-4xl font-display text-rose-600 dark:text-rose-500">
                            {stats && stats.today ? stats.today.absent : "-"}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Add Student Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Enroll New Student</CardTitle>
                        <CardDescription>Add a student to your class roster.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddStudent} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sName">Full Name</Label>
                                    <Input
                                        id="sName"
                                        required
                                        value={newStudent.name}
                                        onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sRoll">Roll Number</Label>
                                    <Input
                                        id="sRoll"
                                        type="number"
                                        required
                                        value={newStudent.roll_num}
                                        onChange={e => setNewStudent({ ...newStudent, roll_num: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sEmail">Email Address</Label>
                                    <Input
                                        id="sEmail"
                                        type="email"
                                        required
                                        value={newStudent.email}
                                        onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sSubject">Subject</Label>
                                    <Input
                                        id="sSubject"
                                        required
                                        value={newStudent.subject}
                                        onChange={e => setNewStudent({ ...newStudent, subject: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sPass">Temporary Password</Label>
                                <Input
                                    id="sPass"
                                    type="password"
                                    required
                                    value={newStudent.password}
                                    onChange={e => setNewStudent({ ...newStudent, password: e.target.value })}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Enrolling..." : "Enroll Student"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Quick Actions / Helpers */}
                <Card className="bg-slate-50 dark:bg-slate-900/50 border-transparent dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <Link href="/dashboard/teacher/attendance" className="w-full">
                                <Button variant="outline" className="justify-start h-12 w-full text-left">
                                    📝 Mark Today's Attendance
                                </Button>
                            </Link>
                            <Link href="/dashboard/teacher/roster" className="w-full">
                                <Button variant="outline" className="justify-start h-12 w-full text-left">
                                    📋 View Full Class Roster
                                </Button>
                            </Link>
                            <Link href="/dashboard/teacher/report" className="w-full">
                                <Button variant="outline" className="justify-start h-12 w-full text-left">
                                    📊 Export Monthly Report
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
