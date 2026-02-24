"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard,
    Users,
    CheckSquare,
    FileBarChart,
    LogOut,
    GraduationCap,
    Sun,
    Moon,
    Menu,
    X
} from "lucide-react";
import { useTheme } from "next-themes";

export function Sidebar() {
    const pathname = usePathname();
    const { user, logoutUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    // Prevent hydration mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (!user) return null;

    const teacherLinks = [
        { name: "Overview", href: "/dashboard/teacher", icon: LayoutDashboard },
        { name: "Attendance", href: "/dashboard/teacher/attendance", icon: CheckSquare },
        { name: "Class Roster", href: "/dashboard/teacher/roster", icon: Users },
        { name: "Reports", href: "/dashboard/teacher/report", icon: FileBarChart },
    ];

    const studentLinks = [
        { name: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
    ];

    const links = user.role === "TEACHER" ? teacherLinks : studentLinks;

    return (
        <aside className="w-full relative md:w-64 md:sticky md:top-8 shrink-0 md:self-start z-40">
            {/* Mobile Header Bar */}
            <div className="md:hidden flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl mb-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-1.5 rounded-md">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-semibold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
                            EduManage
                        </h2>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 focus:outline-none"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Main Sidebar Content */}
            <div className={cn(
                "flex-col bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-4 transition-colors duration-300 md:h-[calc(100vh-4rem)]",
                isOpen ? "flex mb-4 shadow-md bg-white dark:bg-slate-900 absolute top-full mt-2 w-full left-0 z-50 md:static md:mt-0" : "hidden md:flex"
            )}>
                {/* Desktop Logo (Hidden on Mobile inside the dropdown) */}
                <div className="hidden md:flex mb-8 px-2 items-center gap-3">
                    <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2 rounded-md transition-colors duration-300">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-semibold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
                            EduManage
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role.toLowerCase()} Portal</p>
                    </div>
                </div>

                <nav className="space-y-1 flex-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="px-3 pb-2">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>

                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="flex items-center gap-3 px-3 py-2 mt-2 w-full rounded-md text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </button>
                    )}

                    <button
                        onClick={logoutUser}
                        className="flex items-center gap-3 px-3 py-2 mt-2 w-full rounded-md text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-700 dark:hover:text-rose-400 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}
