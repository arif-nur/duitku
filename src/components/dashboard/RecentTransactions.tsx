"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Edit2, Trash2, ArrowRight, Inbox } from "lucide-react";
import { Transaction } from "@/types";
import { formatRupiah, formatTanggalPendek } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useFinance } from "@/context/FinanceContext";
import { useToast } from "@/context/ToastContext";

interface RecentTransactionsProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
}

export function RecentTransactions({ transactions, onEdit }: RecentTransactionsProps) {
  const { deleteTransaction } = useFinance();
  const { showSuccess, showError } = useToast();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deletingId) return;
    const res = await deleteTransaction(deletingId);
    if (res.success) {
      showSuccess("Transaksi berhasil dihapus!");
    } else {
      showError(res.error || "Gagal menghapus transaksi.");
    }
    setDeletingId(null);
  };

  const recentList = transactions.slice(0, 6);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Transaksi Terbaru</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pemasukan dan pengeluaran terkini</p>
        </div>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          Lihat Semua
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recentList.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Belum Ada Transaksi</p>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Mulai catat transaksi pertama Anda dengan tombol aksi cepat di atas.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-2">
          {recentList.map((tx) => {
            const isIncome = tx.type === "income";
            return (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between gap-3 group hover:bg-slate-50/60 dark:hover:bg-slate-800/30 rounded-2xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                        {tx.category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium capitalize shrink-0">
                        {tx.paymentMethod}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                      <span>{formatTanggalPendek(tx.date)}</span>
                      {tx.note && <span>• {tx.note}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-sm sm:text-base font-bold ${
                      isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatRupiah(tx.amount)}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(tx)}
                      title="Edit Transaksi"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(tx.id)}
                      title="Hapus Transaksi"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        title="Hapus Transaksi Ini?"
        description="Transaksi yang dihapus akan otomatis menyesuaikan kembali saldo Anda secara akurat. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
