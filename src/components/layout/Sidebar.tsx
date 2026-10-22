"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  PiggyBank,
  PieChart,
  BarChart3,
  Settings,
  LogOut,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/lib/utils";
import { useFinance } from "@/context/FinanceContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Semua Transaksi", icon: History },
  { href: "/income", label: "Pemasukan", icon: ArrowDownLeft },
  { href: "/expenses", label: "Pengeluaran", icon: ArrowUpRight },
  { href: "/savings", label: "Tabungan", icon: PiggyBank },
  { href: "/budgets", label: "Anggaran", icon: PieChart },
  { href: "/reports", label: "Laporan Keuangan", icon: BarChart3 },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { userProfile, logout } = useAuth();
  const { availableBalance } = useFinance();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            CuanKu
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Catatan Keuangan Pribadi
          </p>
        </div>
      </div>

      {/* Saldo Mini Widget */}
      <div className="mx-4 my-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          Saldo Tersedia
        </span>
        <div className="text-base font-bold text-emerald-900 dark:text-emerald-200 mt-0.5 truncate">
          {formatRupiah(availableBalance)}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info & Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold flex items-center justify-center text-xs shrink-0">
              {userProfile?.displayName ? userProfile.displayName[0].toUpperCase() : "U"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {userProfile?.displayName || "Pengguna"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {userProfile?.email || "saya@cuanku.id"}
              </p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Keluar"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
