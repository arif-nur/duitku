"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, MinusCircle, PiggyBank, History } from "lucide-react";

interface QuickActionsProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
  onAddSavings: () => void;
}

export function QuickActions({
  onAddIncome,
  onAddExpense,
  onAddSavings,
}: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Tambah Pemasukan */}
      <button
        onClick={onAddIncome}
        className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
      >
        <PlusCircle className="w-4 h-4 shrink-0" />
        <span>+ Pemasukan</span>
      </button>

      {/* Tambah Pengeluaran */}
      <button
        onClick={onAddExpense}
        className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-rose-600/20 active:scale-95 transition-all"
      >
        <MinusCircle className="w-4 h-4 shrink-0" />
        <span>− Pengeluaran</span>
      </button>

      {/* Tambah Tabungan / Setor */}
      <button
        onClick={onAddSavings}
        className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-teal-600/20 active:scale-95 transition-all"
      >
        <PiggyBank className="w-4 h-4 shrink-0" />
        <span>+ Tabungan</span>
      </button>

      {/* Lihat Semua Transaksi */}
      <Link
        href="/transactions"
        className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm active:scale-95 transition-all text-center"
      >
        <History className="w-4 h-4 shrink-0" />
        <span>Lihat Semua</span>
      </Link>
    </div>
  );
}
