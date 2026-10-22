"use client";

import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import {
  Transaction,
  TransactionType,
  PaymentMethod,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
} from "@/types";
import { getTodayDateString, formatRupiah } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { useFinance } from "@/context/FinanceContext";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
}

export function TransactionModal({
  isOpen,
  onClose,
  initialType = "expense",
  editingTransaction = null,
}: TransactionModalProps) {
  const { showSuccess, showError } = useToast();
  const { addTransaction, updateTransaction, availableBalance } = useFinance();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountStr(String(editingTransaction.amount));
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNote(editingTransaction.note || "");
    } else {
      setType(initialType);
      setAmountStr("");
      setCategory(initialType === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
      setDate(getTodayDateString());
      setPaymentMethod("bank");
      setNote("");
    }
  }, [editingTransaction, initialType, isOpen]);

  // Handle category default change when type switches
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  if (!isOpen) return null;

  const currentCategories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const numAmount = parseFloat(amountStr) || 0;
  const isOverBalance =
    type === "expense" &&
    !editingTransaction &&
    numAmount > availableBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountStr || numAmount <= 0) {
      showError("Nominal harus lebih besar dari 0!");
      return;
    }
    if (!category) {
      showError("Kategori harus dipilih!");
      return;
    }
    if (!date) {
      showError("Tanggal transaksi harus diisi!");
      return;
    }

    setSubmitting(true);
    try {
      if (editingTransaction) {
        const res = await updateTransaction(editingTransaction.id, {
          type,
          amount: numAmount,
          category,
          date,
          paymentMethod,
          note: note.trim(),
        });
        if (res.success) {
          showSuccess("Transaksi berhasil diperbarui!");
          onClose();
        } else {
          showError(res.error || "Gagal memperbarui transaksi.");
        }
      } else {
        const res = await addTransaction({
          type,
          amount: numAmount,
          category,
          date,
          paymentMethod,
          note: note.trim(),
        });
        if (res.success) {
          showSuccess(
            type === "income"
              ? "Pemasukan berhasil dicatat! Saldo otomatis bertambah."
              : "Pengeluaran berhasil dicatat! Saldo otomatis berkurang."
          );
          onClose();
        } else {
          showError(res.error || "Gagal menyimpan transaksi.");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingTransaction
              ? "Edit Transaksi"
              : type === "income"
              ? "Tambah Pemasukan"
              : "Tambah Pengeluaran"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Transaction Type Selector (Disabled when editing) */}
          {!editingTransaction && (
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => handleTypeChange("income")}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  type === "income"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                + Pemasukan
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("expense")}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  type === "expense"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                − Pengeluaran
              </button>
            </div>
          )}

          {/* Nominal */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Nominal (Rp) *
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

            {/* Over Balance Warning */}
            {isOverBalance && (
              <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2 text-amber-700 dark:text-amber-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Peringatan Saldo:</strong> Nominal ini melebihi Saldo Tersedia saat ini ({formatRupiah(availableBalance)}). Saldo Anda akan menjadi minus jika dilanjutkan.
                </span>
              </div>
            )}
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Kategori *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              {currentCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal & Metode Pembayaran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Tanggal *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Catatan Tambahan
            </label>
            <input
              type="text"
              placeholder="Contoh: Beli bensin Pertalite, makan siang bareng tim"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-2xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2.5 rounded-2xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${
                type === "income"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25"
                  : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/25"
              } ${submitting ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {submitting
                ? "Menyimpan..."
                : editingTransaction
                ? "Perbarui"
                : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
