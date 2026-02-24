"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

export type Role = "TEACHER" | "STUDENT";

interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    subject?: string;
    roll_num?: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginUser: (user: User) => void;
    logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in via HTTP-Only cookie when app loads
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await api.get("/auth/me");
                setUser(data.user);
            } catch (err) {
                // If 401/404, we just clear user and move on (they aren't logged in)
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const loginUser = (userData: User) => {
        setUser(userData);
    };

    const logoutUser = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout API failed, but clearing local state anyway", error);
        } finally {
            setUser(null);
            // Optionally force a hard reload to clear any residual data
            window.location.href = "/";
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
