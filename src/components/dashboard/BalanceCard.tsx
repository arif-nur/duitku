"use client";

import React, { useState } from "react";
import { Wallet, PiggyBank, TrendingUp, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface BalanceCardProps {
  availableBalance: number;
  totalSavings: number;
  netWorth: number;
}

export function BalanceCard({
  availableBalance,
  totalSavings,
  netWorth,
}: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20">
      {/* Decorative background shapes */}
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white/15 backdrop-blur-md">
            <Wallet className="w-5 h-5 text-emerald-200" />
          </div>
          <span className="text-sm font-medium text-emerald-100">Saldo Tersedia (Cash & Bank)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-emerald-100"
            title={showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
          >
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Balance */}
      <div className="relative z-10 mt-4">
        <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          {showBalance ? formatRupiah(availableBalance) : "••••••••"}
        </div>
        <p className="mt-1.5 text-xs sm:text-sm text-emerald-100/80 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-300 inline" />
          Dihitung otomatis: Saldo awal + Pemasukan − Pengeluaran − Tabungan
        </p>
      </div>

      {/* Breakdown Subcards (Total Tabungan & Total Kekayaan) */}
      <div className="relative z-10 mt-6 pt-6 border-t border-white/15 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
            <PiggyBank className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <span className="text-xs text-emerald-200/90 font-medium">Total Tabungan</span>
            <p className="text-sm sm:text-base font-bold text-white">
              {showBalance ? formatRupiah(totalSavings) : "••••••"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-400/30">
            <TrendingUp className="w-5 h-5 text-teal-200" />
          </div>
          <div>
            <span className="text-xs text-teal-200/90 font-medium">Total Kekayaan Bersih</span>
            <p className="text-sm sm:text-base font-bold text-white">
              {showBalance ? formatRupiah(netWorth) : "••••••"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
