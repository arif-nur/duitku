"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="mt-4 text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400">
          Memuat data DuitKu...
        </p>
      </div>
    );
  }

  // If public route, render without sidebar / bottom nav
  if (isPublicRoute) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
