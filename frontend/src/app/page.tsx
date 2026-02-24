"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const { loginUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    subject: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { data } = await api.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });
        loginUser(data.user);
        toast.success("Welcome back!");
        router.push(data.user.role === "TEACHER" ? "/dashboard/teacher" : "/dashboard/student");
      } else {
        await api.post("/auth/register", formData);
        toast.success("Registration successful! Please login.");
        setIsLogin(true); // Switch to login view
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        // Check for Zod Validation mapping from backend
        if (error.response.data.errors) {
          const firstError = error.response.data.errors[0];
          toast.error(`${firstError.field}: ${firstError.message}`);
        } else {
          toast.error(error.response.data.message || "Authentication failed");
        }
      } else {
        toast.error("Network error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[80vh] w-full items-center justify-center relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="font-display text-2xl tracking-tight">
            {isLogin ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Enter your credentials to access your portal"
              : "Register as a new educator"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  required
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="jane@education.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  required
                  placeholder="Mathematics"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
            )}

            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Register")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="font-medium text-slate-900 dark:text-slate-50 hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Register" : "Sign In"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
