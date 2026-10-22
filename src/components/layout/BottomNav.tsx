"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  PieChart,
} from "lucide-react";

const mobileNavItems = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/income", label: "Masuk", icon: ArrowDownLeft },
  { href: "/expenses", label: "Keluar", icon: ArrowUpRight },
  { href: "/savings", label: "Tabungan", icon: PiggyBank },
  { href: "/budgets", label: "Anggaran", icon: PieChart },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isActive
                ? "text-emerald-600 dark:text-emerald-400 font-bold scale-105"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
