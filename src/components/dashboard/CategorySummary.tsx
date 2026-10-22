"use client";

import React from "react";
import { PieChart, AlertCircle } from "lucide-react";
import { Transaction } from "@/types";
import { formatRupiah, getCurrentMonthString } from "@/lib/utils";

interface CategorySummaryProps {
  transactions: Transaction[];
}

export function CategorySummary({ transactions }: CategorySummaryProps) {
  const currentMonth = getCurrentMonthString();

  // Aggregate current month expense categories
  const expenseMap = new Map<string, number>();
  let totalExpenseThisMonth = 0;

  for (const t of transactions) {
    if (t.type === "expense" && t.date.startsWith(currentMonth)) {
      const cur = expenseMap.get(t.category) || 0;
      expenseMap.set(t.category, cur + t.amount);
      totalExpenseThisMonth += t.amount;
    }
  }

  const categoryList = Array.from(expenseMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenseThisMonth > 0 ? Math.round((amount / totalExpenseThisMonth) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const colors = [
    "bg-rose-500",
    "bg-amber-500",
    "bg-indigo-500",
    "bg-sky-500",
    "bg-emerald-500",
    "bg-purple-500",
    "bg-teal-500",
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Ringkasan Kategori</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pengeluaran terbesar bulan ini</p>
        </div>
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          <PieChart className="w-4 h-4" />
        </div>
      </div>

      {categoryList.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-xs text-slate-400">Belum ada pengeluaran di bulan ini.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3.5">
          {categoryList.slice(0, 5).map((item, index) => {
            const barColor = colors[index % colors.length];
            return (
              <div key={item.category}>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${barColor}`} />
                    {item.category}
                  </span>
                  <div className="text-right">
                    <span className="text-slate-900 dark:text-white mr-2">
                      {formatRupiah(item.amount)}
                    </span>
                    <span className="text-slate-400 text-[11px] font-normal">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
