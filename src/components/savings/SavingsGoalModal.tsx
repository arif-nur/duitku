"use client";

import React, { useState, useEffect } from "react";
import { X, PiggyBank } from "lucide-react";
import { SavingsGoal } from "@/types";
import { formatRupiah, getTodayDateString } from "@/lib/utils";
import { useFinance } from "@/context/FinanceContext";
import { useToast } from "@/context/ToastContext";

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoal?: SavingsGoal | null;
}

const COLOR_OPTIONS = [
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#8b5cf6", // Purple
];

export function SavingsGoalModal({
  isOpen,
  onClose,
  editingGoal = null,
}: SavingsGoalModalProps) {
  const { addSavingsGoal, updateSavingsGoal } = useFinance();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState("");
  const [targetAmountStr, setTargetAmountStr] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingGoal) {
      setName(editingGoal.name);
      setTargetAmountStr(String(editingGoal.targetAmount));
      setTargetDate(editingGoal.targetDate);
      setColor(editingGoal.color || COLOR_OPTIONS[0]);
      setNote(editingGoal.note || "");
    } else {
      setName("");
      setTargetAmountStr("");
      // Default target date: 6 months from now
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      setTargetDate(`${y}-${m}-${day}`);
      setColor(COLOR_OPTIONS[0]);
      setNote("");
    }
  }, [editingGoal, isOpen]);

  if (!isOpen) return null;

  const numTarget = parseFloat(targetAmountStr) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError("Nama target tabungan wajib diisi!");
      return;
    }
    if (!targetAmountStr || numTarget <= 0) {
      showError("Target nominal harus lebih besar dari 0!");
      return;
    }
    if (!targetDate) {
      showError("Tanggal target harus ditentukan!");
      return;
    }

    setSubmitting(true);
    try {
      if (editingGoal) {
        const res = await updateSavingsGoal(editingGoal.id, {
          name: name.trim(),
          targetAmount: numTarget,
          targetDate,
          color,
          note: note.trim(),
        });
        if (res.success) {
          showSuccess("Target tabungan berhasil diperbarui!");
          onClose();
        } else {
          showError(res.error || "Gagal memperbarui tabungan.");
        }
      } else {
        const res = await addSavingsGoal({
          name: name.trim(),
          targetAmount: numTarget,
          targetDate,
          color,
          note: note.trim(),
        });
        if (res.success) {
          showSuccess("Target tabungan baru berhasil dibuat!");
          onClose();
        } else {
          showError(res.error || "Gagal membuat target tabungan.");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <PiggyBank className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingGoal ? "Edit Target Tabungan" : "Buat Target Tabungan Baru"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Nama Impian / Target *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Beli Laptop Baru, Liburan ke Bali"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Target Nominal (Rp) *
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
                value={targetAmountStr}
                onChange={(e) => setTargetAmountStr(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            {numTarget > 0 && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                Terbaca: {formatRupiah(numTarget)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Target Tanggal Tercapai *
            </label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Color theme for card */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Warna Kartu
            </label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === c ? "ring-4 ring-slate-300 dark:ring-slate-600 scale-110" : "opacity-80 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Catatan / Motivasi
            </label>
            <input
              type="text"
              placeholder="Contoh: Sisihkan minimal 500rb per bulan"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

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
              disabled={submitting}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all active:scale-95 ${
                submitting ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? "Menyimpan..." : editingGoal ? "Simpan Perubahan" : "Buat Target"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
