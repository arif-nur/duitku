"use client";

import React, { useState } from "react";
import { PiggyBank, Target, Calendar, PlusCircle, MinusCircle, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { SavingsGoal } from "@/types";
import { formatRupiah, formatTanggalIndo } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useFinance } from "@/context/FinanceContext";
import { useToast } from "@/context/ToastContext";

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onDeposit: (goal: SavingsGoal) => void;
  onWithdraw: (goal: SavingsGoal) => void;
  onEdit: (goal: SavingsGoal) => void;
}

export function SavingsGoalCard({
  goal,
  onDeposit,
  onWithdraw,
  onEdit,
}: SavingsGoalCardProps) {
  const { deleteSavingsGoal } = useFinance();
  const { showSuccess, showError } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const percentage = goal.targetAmount > 0
    ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
    : 0;

  const isCompleted = goal.currentAmount >= goal.targetAmount;

  const handleDelete = async () => {
    const res = await deleteSavingsGoal(goal.id);
    if (res.success) {
      showSuccess("Target tabungan berhasil dihapus.");
    } else {
      showError(res.error || "Gagal menghapus target tabungan.");
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-md"
              style={{ backgroundColor: goal.color || "#10b981" }}
            >
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                {goal.name}
                {isCompleted && (
                  <span title="Target Tercapai!">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                Target: {formatTanggalIndo(goal.targetDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(goal)}
              title="Edit Target"
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              title="Hapus Target"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Percent */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between text-xs mb-1.5">
            <span className="text-slate-500 font-medium">Progres Terkumpul:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {percentage}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? "bg-emerald-500" : "bg-teal-500"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Financial Numbers */}
        <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Terkumpul</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {formatRupiah(goal.currentAmount)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Target</span>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-0.5">
              {formatRupiah(goal.targetAmount)}
            </p>
          </div>
        </div>

        {goal.note && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
            "{goal.note}"
          </p>
        )}
      </div>

      {/* Action Buttons (Setor & Tarik) */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <button
          onClick={() => onDeposit(goal)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Setor Uang</span>
        </button>

        <button
          onClick={() => onWithdraw(goal)}
          disabled={goal.currentAmount <= 0}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <MinusCircle className="w-3.5 h-3.5" />
          <span>Tarik Uang</span>
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={`Hapus Tabungan "${goal.name}"?`}
        description={`Target tabungan ini akan dihapus. Jika masih terdapat saldo (${formatRupiah(
          goal.currentAmount
        )}), dana akan otomatis dikembalikan ke Saldo Tersedia Anda.`}
        confirmLabel="Hapus Target"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
