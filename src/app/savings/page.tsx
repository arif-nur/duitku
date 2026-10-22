"use client";

import React, { useState } from "react";
import {
  PiggyBank,
  PlusCircle,
  History,
  Target,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Inbox,
  Sparkles,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { SavingsGoal } from "@/types";
import { formatRupiah, formatTanggalIndo } from "@/lib/utils";
import { SavingsGoalCard } from "@/components/savings/SavingsGoalCard";
import { SavingsGoalModal } from "@/components/savings/SavingsGoalModal";
import { SavingsMovementModal } from "@/components/savings/SavingsMovementModal";

export default function SavingsPage() {
  const { savingsGoals, savingsMovements, totalSavings, availableBalance } = useFinance();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [moveMode, setMoveMode] = useState<"deposit" | "withdraw">("deposit");

  const handleOpenAddGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleOpenEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleOpenDeposit = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setMoveMode("deposit");
    setIsMoveModalOpen(true);
  };

  const handleOpenWithdraw = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setMoveMode("withdraw");
    setIsMoveModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <PiggyBank className="w-6 h-6" />
            </span>
            Target Tabungan Impian
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pisahkan dan alokasikan dana untuk masa depan tanpa tercampur dengan saldo operasional harian.
          </p>
        </div>

        <button
          onClick={handleOpenAddGoal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-teal-600/20 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Target Baru</span>
        </button>
      </div>

      {/* Financial Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-700 to-emerald-800 text-white shadow-lg">
          <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold uppercase tracking-wider">
            <PiggyBank className="w-4 h-4" />
            <span>Total Dana di Seluruh Tabungan</span>
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-extrabold">
            {formatRupiah(totalSavings)}
          </div>
          <p className="mt-1 text-xs text-teal-100/80">
            Terbagi ke dalam {savingsGoals.length} target impian aktif
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Saldo Siap Alokasi (Tersedia)
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {formatRupiah(availableBalance)}
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Maksimal uang yang dapat Anda setor saat ini tanpa membuat saldo operasional Anda minus.
          </p>
        </div>
      </div>

      {/* Savings Goals Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Daftar Target Tabungan
        </h2>

        {savingsGoals.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <PiggyBank className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Belum Ada Target Tabungan
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
              Tentukan target impian Anda seperti Beli Laptop Baru, Dana Darurat, Liburan, atau Kendaraan.
            </p>
            <button
              onClick={handleOpenAddGoal}
              className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all"
            >
              + Mulai Buat Target Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savingsGoals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                onDeposit={handleOpenDeposit}
                onWithdraw={handleOpenWithdraw}
                onEdit={handleOpenEditGoal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Savings Movement History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <History className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Riwayat Setoran & Penarikan Tabungan
            </h3>
            <p className="text-xs text-slate-400">
              Mutasi perpindahan dana antara saldo tersedia dan pos tabungan
            </p>
          </div>
        </div>

        {savingsMovements.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-xs text-slate-400">Belum ada riwayat transaksi tabungan.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {savingsMovements.slice(0, 10).map((move) => {
              const isDeposit = move.type === "deposit";
              return (
                <div
                  key={move.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl text-white shrink-0 ${
                        isDeposit ? "bg-emerald-600" : "bg-sky-600"
                      }`}
                    >
                      {isDeposit ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {isDeposit ? "Setoran ke" : "Penarikan dari"} {move.goalName}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatTanggalIndo(move.date)} {move.note ? `• ${move.note}` : ""}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-black text-sm ${
                      isDeposit ? "text-emerald-600 dark:text-emerald-400" : "text-sky-600 dark:text-sky-400"
                    }`}
                  >
                    {isDeposit ? "+" : "-"}
                    {formatRupiah(move.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Savings Goal Modal */}
      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        editingGoal={editingGoal}
      />

      {/* Movement Modal */}
      <SavingsMovementModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        goal={selectedGoal}
        mode={moveMode}
      />
    </div>
  );
}
