"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Save,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Target,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { useToast } from "@/context/ToastContext";
import { EXPENSE_CATEGORIES } from "@/types";
import { formatRupiah, getCurrentMonthString } from "@/lib/utils";

export default function BudgetsPage() {
  const { transactions, budgets, currentMonthBudget, saveBudget } = useFinance();
  const { showSuccess, showError } = useToast();

  const [month, setMonth] = useState(getCurrentMonthString());
  const [totalBudgetStr, setTotalBudgetStr] = useState("");
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load existing budget data when month changes
  useEffect(() => {
    const found = budgets.find((b) => b.month === month);
    if (found) {
      setTotalBudgetStr(String(found.totalBudget));
      const strMap: Record<string, string> = {};
      for (const [k, v] of Object.entries(found.categoryBudgets || {})) {
        strMap[k] = String(v);
      }
      setCategoryBudgets(strMap);
    } else {
      setTotalBudgetStr("");
      setCategoryBudgets({});
    }
  }, [month, budgets]);

  // Calculate actual expenses for the selected month
  const { monthExpense, categoryExpenses } = useMemo(() => {
    let total = 0;
    const catMap: Record<string, number> = {};

    for (const t of transactions) {
      if (t.type === "expense" && t.date.startsWith(month)) {
        total += t.amount;
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      }
    }
    return { monthExpense: total, categoryExpenses: catMap };
  }, [transactions, month]);

  const numTotalBudget = parseFloat(totalBudgetStr) || 0;
  const remainingTotalBudget = numTotalBudget > 0 ? numTotalBudget - monthExpense : null;
  const totalUsagePercent =
    numTotalBudget > 0 ? Math.min(100, Math.round((monthExpense / numTotalBudget) * 100)) : 0;

  const handleCategoryChange = (cat: string, val: string) => {
    setCategoryBudgets((prev) => ({ ...prev, [cat]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalBudgetStr || numTotalBudget <= 0) {
      showError("Total batas anggaran bulanan harus diisi lebih dari 0!");
      return;
    }

    const parsedCategories: Record<string, number> = {};
    for (const [k, v] of Object.entries(categoryBudgets)) {
      const num = parseFloat(v);
      if (num && num > 0) {
        parsedCategories[k] = num;
      }
    }

    setSubmitting(true);
    try {
      const res = await saveBudget(month, numTotalBudget, parsedCategories);
      if (res.success) {
        showSuccess(`Anggaran untuk bulan ${month} berhasil disimpan!`);
      } else {
        showError(res.error || "Gagal menyimpan anggaran.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <PieChart className="w-6 h-6" />
            </span>
            Anggaran Bulanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tetapkan batas pengeluaran bulanan dan per kategori agar tidak boros.
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold shadow-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Main Budget Progress Overview */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Status Pemakaian Anggaran ({month})
            </span>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                {formatRupiah(monthExpense)}
              </span>
              <span className="text-xs sm:text-sm text-slate-400 font-medium">
                dari batas {numTotalBudget > 0 ? formatRupiah(numTotalBudget) : "Belum ditentukan"}
              </span>
            </div>
          </div>

          {numTotalBudget > 0 && (
            <div
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                totalUsagePercent >= 100
                  ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600"
                  : totalUsagePercent >= 80
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600"
                  : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600"
              }`}
            >
              {totalUsagePercent >= 80 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>
                {totalUsagePercent >= 100
                  ? "Batas Anggaran Terlampaui!"
                  : totalUsagePercent >= 80
                  ? "Peringatan: 80% Terpakai!"
                  : "Pengeluaran Terkendali"}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {numTotalBudget > 0 && (
          <div className="mt-6">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalUsagePercent >= 100
                    ? "bg-rose-500"
                    : totalUsagePercent >= 80
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${totalUsagePercent}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>{totalUsagePercent}% digunakan</span>
              <span>
                Sisa:{" "}
                <strong
                  className={
                    remainingTotalBudget !== null && remainingTotalBudget < 0
                      ? "text-rose-500"
                      : "text-emerald-600 dark:text-emerald-400"
                  }
                >
                  {remainingTotalBudget !== null ? formatRupiah(remainingTotalBudget) : "-"}
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Budget Setting Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Pengaturan Batas Anggaran Bulanan
          </h3>

          <div className="max-w-md">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Total Batas Anggaran (Rp) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                Rp
              </span>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="Contoh: 3000000"
                value={totalBudgetStr}
                onChange={(e) => setTotalBudgetStr(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category Budget Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Batas Anggaran per Kategori (Opsional)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Beri batas spesifik pada pos-pos belanja tertentu untuk mendeteksi pemborosan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {EXPENSE_CATEGORIES.map((cat) => {
              const spent = categoryExpenses[cat] || 0;
              const limitStr = categoryBudgets[cat] || "";
              const limitNum = parseFloat(limitStr) || 0;
              const catPercent =
                limitNum > 0 ? Math.min(100, Math.round((spent / limitNum) * 100)) : 0;
              const remaining = limitNum > 0 ? limitNum - spent : null;

              return (
                <div
                  key={cat}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {cat}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Terpakai: <strong>{formatRupiah(spent)}</strong>
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                      Rp
                    </span>
                    <input
                      type="number"
                      placeholder="Batas maksimal (opsional)"
                      value={limitStr}
                      onChange={(e) => handleCategoryChange(cat, e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {limitNum > 0 && (
                    <div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            catPercent >= 100
                              ? "bg-rose-500"
                              : catPercent >= 80
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${catPercent}%` }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-[11px] font-medium text-slate-400">
                        <span>{catPercent}% terpakai</span>
                        <span className={remaining !== null && remaining < 0 ? "text-rose-500" : ""}>
                          Sisa: {remaining !== null ? formatRupiah(remaining) : "-"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? "Menyimpan..." : "Simpan Pengaturan Anggaran"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
