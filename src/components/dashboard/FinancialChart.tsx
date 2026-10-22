"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { Transaction } from "@/types";
import { formatRupiah, formatTanggalPendek } from "@/lib/utils";

interface FinancialChartProps {
  transactions: Transaction[];
}

type Period = "daily" | "weekly" | "monthly";

export function FinancialChart({ transactions }: FinancialChartProps) {
  const [period, setPeriod] = useState<Period>("daily");

  const chartData = useMemo(() => {
    const now = new Date();

    if (period === "daily") {
      // Last 7 days
      const days: { dateStr: string; label: string; income: number; expense: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const dateStr = `${y}-${m}-${day}`;
        days.push({
          dateStr,
          label: formatTanggalPendek(dateStr),
          income: 0,
          expense: 0,
        });
      }

      for (const t of transactions) {
        const target = days.find((d) => d.dateStr === t.date);
        if (target) {
          if (t.type === "income") target.income += t.amount;
          else if (t.type === "expense") target.expense += t.amount;
        }
      }
      return days;
    } else if (period === "weekly") {
      // Last 4 weeks
      const weeks: { weekNum: number; label: string; income: number; expense: number }[] = [
        { weekNum: 4, label: "3 Minggu Lalu", income: 0, expense: 0 },
        { weekNum: 3, label: "2 Minggu Lalu", income: 0, expense: 0 },
        { weekNum: 2, label: "Minggu Lalu", income: 0, expense: 0 },
        { weekNum: 1, label: "Minggu Ini", income: 0, expense: 0 },
      ];

      for (const t of transactions) {
        const tDate = new Date(t.date);
        const diffDays = Math.floor((now.getTime() - tDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          if (t.type === "income") weeks[3].income += t.amount;
          else weeks[3].expense += t.amount;
        } else if (diffDays >= 7 && diffDays < 14) {
          if (t.type === "income") weeks[2].income += t.amount;
          else weeks[2].expense += t.amount;
        } else if (diffDays >= 14 && diffDays < 21) {
          if (t.type === "income") weeks[1].income += t.amount;
          else weeks[1].expense += t.amount;
        } else if (diffDays >= 21 && diffDays < 28) {
          if (t.type === "income") weeks[0].income += t.amount;
          else weeks[0].expense += t.amount;
        }
      }
      return weeks;
    } else {
      // Last 6 months
      const months: { monthKey: string; label: string; income: number; expense: number }[] = [];
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
      ];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const monthKey = `${y}-${m}`;
        months.push({
          monthKey,
          label: `${monthNames[d.getMonth()]} ${y}`,
          income: 0,
          expense: 0,
        });
      }

      for (const t of transactions) {
        const mKey = t.date.slice(0, 7);
        const target = months.find((m) => m.monthKey === mKey);
        if (target) {
          if (t.type === "income") target.income += t.amount;
          else if (t.type === "expense") target.expense += t.amount;
        }
      }
      return months;
    }
  }, [transactions, period]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Grafik Arus Keuangan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Perbandingan pemasukan & pengeluaran
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setPeriod("daily")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              period === "daily"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Harian
          </button>
          <button
            onClick={() => setPeriod("weekly")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              period === "weekly"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Mingguan
          </button>
          <button
            onClick={() => setPeriod("monthly")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              period === "monthly"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Bulanan
          </button>
        </div>
      </div>

      <div className="mt-6 h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickFormatter={(v) => {
                if (v >= 1000000) return `${(v / 1000000).toFixed(1)}jt`;
                if (v >= 1000) return `${(v / 1000).toFixed(0)}rb`;
                return String(v);
              }}
            />
            <Tooltip
              formatter={(value: any, name: any) => [
                formatRupiah(Number(value) || 0),
                name === "income" ? "Pemasukan" : "Pengeluaran",
              ]}
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#1e293b",
                borderRadius: "1rem",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "500",
              }}
            />
            <Legend
              formatter={(value) => (value === "income" ? "Pemasukan" : "Pengeluaran")}
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
            />
            <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
            <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
