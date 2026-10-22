"use client";

import React, { useState } from "react";
import { X, ArrowDownRight, ArrowUpRight, AlertCircle, ShieldCheck } from "lucide-react";
import { SavingsGoal } from "@/types";
import { formatRupiah } from "@/lib/utils";
import { useFinance } from "@/context/FinanceContext";
import { useToast } from "@/context/ToastContext";

interface SavingsMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  mode: "deposit" | "withdraw";
}

export function SavingsMovementModal({
  isOpen,
  onClose,
  goal,
  mode,
}: SavingsMovementModalProps) {
  const { depositToGoal, withdrawFromGoal, availableBalance } = useFinance();
  const { showSuccess, showError } = useToast();

  const [amountStr, setAmountStr] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !goal) return null;

  const numAmount = parseFloat(amountStr) || 0;
  const isDeposit = mode === "deposit";

  const isDepositExceeds = isDeposit && numAmount > availableBalance;
  const isWithdrawExceeds = !isDeposit && numAmount > goal.currentAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountStr || numAmount <= 0) {
      showError("Nominal harus lebih besar dari 0!");
      return;
    }

    if (isDepositExceeds) {
      showError(`Saldo Tersedia tidak mencukupi (${formatRupiah(availableBalance)}).`);
      return;
    }

    if (isWithdrawExceeds) {
      showError(`Saldo tabungan hanya tersisa ${formatRupiah(goal.currentAmount)}.`);
      return;
    }

    setSubmitting(true);
    try {
      if (isDeposit) {
        const res = await depositToGoal(goal.id, numAmount, note.trim());
        if (res.success) {
          showSuccess(
            `Berhasil menyetor ${formatRupiah(numAmount)} ke ${goal.name}! Uang dipindahkan dari saldo tersedia.`
          );
          onClose();
        } else {
          showError(res.error || "Gagal menyetor ke tabungan.");
        }
      } else {
        const res = await withdrawFromGoal(goal.id, numAmount, note.trim());
        if (res.success) {
          showSuccess(
            `Berhasil menarik ${formatRupiah(numAmount)} dari ${goal.name}! Saldo tersedia bertambah.`
          );
          onClose();
        } else {
          showError(res.error || "Gagal menarik dari tabungan.");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl text-white ${
                isDeposit ? "bg-emerald-600" : "bg-sky-600"
              }`}
            >
              {isDeposit ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isDeposit ? "Setor ke Tabungan" : "Tarik dari Tabungan"}
              </h3>
              <p className="text-xs text-slate-400">{goal.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status context */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-400 font-medium">Saldo Tersedia:</span>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {formatRupiah(availableBalance)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-slate-400 font-medium">Terkumpul di Tabungan:</span>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {formatRupiah(goal.currentAmount)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Nominal {isDeposit ? "Setoran" : "Penarikan"} (Rp) *
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
                placeholder="0"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            {numAmount > 0 && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                Terbaca: {formatRupiah(numAmount)}
              </p>
            )}

            {isDepositExceeds && (
              <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-rose-600 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Nominal melebihi Saldo Tersedia Anda!</span>
              </div>
            )}

            {isWithdrawExceeds && (
              <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-rose-600 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Nominal melebihi saldo yang ada di tabungan ini!</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Keterangan / Catatan
            </label>
            <input
              type="text"
              placeholder={isDeposit ? "Contoh: Sisihan gaji bulan ini" : "Contoh: Ditarik untuk DP laptop"}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>
              {isDeposit
                ? "Setoran akan memindahkan uang dari saldo tersedia ke tabungan tanpa dihitung pengeluaran konsumtif."
                : "Penarikan akan mengembalikan dana dari tabungan kembali ke saldo tersedia Anda."}
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-2xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || isDepositExceeds || isWithdrawExceeds}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${
                isDeposit
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25"
                  : "bg-sky-600 hover:bg-sky-700 shadow-sky-600/25"
              } ${(submitting || isDepositExceeds || isWithdrawExceeds) ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {submitting ? "Memproses..." : isDeposit ? "Konfirmasi Setor" : "Konfirmasi Tarik"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
