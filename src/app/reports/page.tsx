"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  Download,
  Award,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useFinance } from "@/context/FinanceContext";
import { formatRupiah, formatTanggalIndo, exportToCSV } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

type PeriodType = "daily" | "weekly" | "monthly" | "yearly";

const PIE_COLORS = [
  "#10b981", "#f43f5e", "#0ea5e9", "#f59e0b",
  "#8b5cf6", "#ec4899", "#14b8a6", "#64748b"
];

export default function ReportsPage() {
  const { transactions, totalSavings, availableBalance, netWorth } = useFinance();
  const { showSuccess } = useToast();

  const [period, setPeriod] = useState<PeriodType>("monthly");

  // Filter transactions based on selected period
  const filteredData = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const tDate = new Date(t.date);
      if (period === "daily") {
        // Today
        return (
          tDate.getFullYear() === now.getFullYear() &&
          tDate.getMonth() === now.getMonth() &&
          tDate.getDate() === now.getDate()
        );
      } else if (period === "weekly") {
        // Last 7 days
        const diff = (now.getTime() - tDate.getTime()) / (1000 * 3600 * 24);
        return diff >= 0 && diff <= 7;
      } else if (period === "monthly") {
        // This month
        return (
          tDate.getFullYear() === now.getFullYear() &&
          tDate.getMonth() === now.getMonth()
        );
      } else {
        // This year
        return tDate.getFullYear() === now.getFullYear();
      }
    });
  }, [transactions, period]);

  // Aggregate stats
  const { periodIncome, periodExpense, categoryBreakdown, largestTransactions } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    const catMap: Record<string, number> = {};

    for (const t of filteredData) {
      if (t.type === "income") inc += t.amount;
      else {
        exp += t.amount;
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      }
    }

    const catArray = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const largest = [...filteredData]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      periodIncome: inc,
      periodExpense: exp,
      categoryBreakdown: catArray,
      largestTransactions: largest,
    };
  }, [filteredData]);

  const netCashflow = periodIncome - periodExpense;

  const comparisonData = [
    {
      name: "Arus Keuangan",
      Pemasukan: periodIncome,
      Pengeluaran: periodExpense,
    },
  ];

  const handleExportReport = () => {
    const rows = filteredData.map((t) => ({
      ID: t.id,
      Tanggal: t.date,
      Jenis: t.type === "income" ? "Pemasukan" : "Pengeluaran",
      Kategori: t.category,
      Nominal: t.amount,
      Metode: t.paymentMethod,
      Catatan: t.note || "",
    }));
    exportToCSV(`Laporan_Keuangan_${period}_${Date.now()}.csv`, rows);
    showSuccess("Laporan periode ini berhasil diunduh!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <BarChart3 className="w-6 h-6" />
            </span>
            Laporan Keuangan Komprehensif
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analisis performa finansial, rasio surplus/defisit, dan pos pengeluaran terbesar Anda.
          </p>
        </div>

        {/* Period Selector Tabs & Export */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex">
            <button
              onClick={() => setPeriod("daily")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                period === "daily" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Harian
            </button>
            <button
              onClick={() => setPeriod("weekly")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                period === "weekly" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Mingguan
            </button>
            <button
              onClick={() => setPeriod("monthly")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                period === "monthly" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setPeriod("yearly")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                period === "yearly" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Tahunan
            </button>
          </div>

          <button
            onClick={handleExportReport}
            disabled={filteredData.length === 0}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-40"
            title="Ekspor Laporan CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Pemasukan
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatRupiah(periodIncome)}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Periode ini</span>
        </div>

        {/* Total Expense */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Pengeluaran
          </span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatRupiah(periodExpense)}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Periode ini</span>
        </div>

        {/* Selisih (Surplus / Defisit) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Selisih (Net Cashflow)
          </span>
          <p
            className={`text-2xl font-black mt-1 ${
              netCashflow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
            }`}
          >
            {netCashflow >= 0 ? "+" : ""}
            {formatRupiah(netCashflow)}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">
            {netCashflow >= 0 ? "Surplus Finansial 🎉" : "Defisit (Pengeluaran > Pemasukan)"}
          </span>
        </div>

        {/* Total Net Worth */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Kekayaan Bersih
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatRupiah(netWorth)}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Saldo Tersedia + Tabungan</span>
        </div>
      </div>

      {/* Visual Charts: Comparison & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Perbandingan Pemasukan vs Pengeluaran
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => formatRupiah(Number(val))}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "1rem",
                    border: "none",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="Pemasukan" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={48} />
                <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[8, 8, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Distribusi Kategori Pengeluaran
          </h3>
          {categoryBreakdown.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              Tidak ada data pengeluaran pada periode ini.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatRupiah(Number(val))}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "1rem",
                      border: "none",
                      color: "#fff",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Largest Transactions Spotlight */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Transaksi Terbesar Periode Ini
          </h3>
        </div>

        {largestTransactions.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">Belum ada transaksi di periode ini.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {largestTransactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{tx.category}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {formatTanggalIndo(tx.date)} {tx.note ? `• ${tx.note}` : ""}
                  </p>
                </div>
                <span
                  className={`font-black ${
                    tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatRupiah(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
