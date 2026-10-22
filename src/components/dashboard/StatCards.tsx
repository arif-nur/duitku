"use client";

import React from "react";
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Target, AlertTriangle } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface StatCardsProps {
  monthIncome: number;
  monthExpense: number;
  totalSavings: number;
  remainingBudget: number | null;
  budgetUsagePercent: number;
  hasBudget: boolean;
}

export function StatCards({
  monthIncome,
  monthExpense,
  totalSavings,
  remainingBudget,
  budgetUsagePercent,
  hasBudget,
}: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Pemasukan Bulan Ini */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pemasukan Bulan Ini
          </span>
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          {formatRupiah(monthIncome)}
        </div>
        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          Total aliran masuk bulan ini
        </p>
      </div>

      {/* Pengeluaran Bulan Ini */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pengeluaran Bulan Ini
          </span>
          <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          {formatRupiah(monthExpense)}
        </div>
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
          Total belanja & konsumsi
        </p>
      </div>

      {/* Total Tabungan */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Tabungan
          </span>
          <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          {formatRupiah(totalSavings)}
        </div>
        <p className="mt-1 text-xs text-teal-600 dark:text-teal-400 font-medium">
          Dana terproteksi untuk masa depan
        </p>
      </div>

      {/* Sisa Anggaran */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Sisa Anggaran
          </span>
          <div
            className={`p-2 rounded-xl ${
              budgetUsagePercent >= 100
                ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600"
                : budgetUsagePercent >= 80
                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600"
                : "bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400"
            }`}
          >
            {budgetUsagePercent >= 80 ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Target className="w-4 h-4" />
            )}
          </div>
        </div>

        <div className="mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          {hasBudget && remainingBudget !== null ? formatRupiah(remainingBudget) : "Belum Diatur"}
        </div>

        {hasBudget ? (
          <div className="mt-2">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetUsagePercent >= 100
                    ? "bg-rose-500"
                    : budgetUsagePercent >= 80
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span>{budgetUsagePercent}% terpakai</span>
              <span>{budgetUsagePercent >= 100 ? "Melebihi Batas!" : budgetUsagePercent >= 80 ? "Peringatan 80%!" : "Aman"}</span>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-xs text-slate-400">Klik menu Anggaran untuk menyetel</p>
        )}
      </div>
    </div>
  );
}
