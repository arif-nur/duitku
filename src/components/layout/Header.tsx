"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sun, Moon, Wifi, WifiOff, History, Settings, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Header({ title }: { title?: string }) {
  const { userProfile, updateUserProfile } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial theme
    const darkTheme = document.documentElement.classList.contains("dark") ||
      localStorage.getItem("duitku_theme") === "dark";
    setIsDark(darkTheme);
    if (darkTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Network status listener
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("duitku_theme", "dark");
      updateUserProfile({ theme: "dark" });
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("duitku_theme", "light");
      updateUserProfile({ theme: "light" });
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      {/* Mobile brand / Page Title */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-base">CuanKu</span>
        </div>
        {title && (
          <h2 className="hidden md:block text-xl font-bold text-slate-800 dark:text-slate-100">
            {title}
          </h2>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Offline / Online indicator */}
        <div
          title={isOnline ? "Tersambung ke internet" : "Sedang offline"}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isOnline
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
              : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Shortcut to all transactions (mobile) */}
        <Link
          href="/transactions"
          title="Riwayat Transaksi"
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <History className="w-4 h-4" />
        </Link>

        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Link to Settings */}
        <Link
          href="/settings"
          title="Pengaturan Akun"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
