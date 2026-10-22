"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowDownLeft,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  Edit2,
  Trash2,
  Download,
  Inbox,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { useToast } from "@/context/ToastContext";
import { Transaction, INCOME_CATEGORIES } from "@/types";
import { formatRupiah, formatTanggalIndo, exportToCSV } from "@/lib/utils";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function IncomePage() {
  const { transactions, deleteTransaction, totalIncome, monthIncome } = useFinance();
  const { showSuccess, showError } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const incomeTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === "income");
  }, [transactions]);

  const filteredIncomes = useMemo(() => {
    return incomeTransactions.filter((tx) => {
      const matchSearch =
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.note && tx.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tx.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === "all" || tx.category === selectedCategory;

      const matchStart = !startDate || tx.date >= startDate;
      const matchEnd = !endDate || tx.date <= endDate;

      return matchSearch && matchCategory && matchStart && matchEnd;
    });
  }, [incomeTransactions, searchQuery, selectedCategory, startDate, endDate]);

  const handleOpenAdd = () => {
    setEditingTx(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const res = await deleteTransaction(deletingId);
    if (res.success) {
      showSuccess("Pemasukan berhasil dihapus! Saldo disesuaikan secara otomatis.");
    } else {
      showError(res.error || "Gagal menghapus pemasukan.");
    }
    setDeletingId(null);
  };

  const handleExportCSV = () => {
    const rows = filteredIncomes.map((item) => ({
      ID: item.id,
      Tanggal: item.date,
      Kategori: item.category,
      Nominal: item.amount,
      Metode: item.paymentMethod,
      Catatan: item.note || "",
    }));
    exportToCSV(`Laporan_Pemasukan_${Date.now()}.csv`, rows);
    showSuccess("Data pemasukan berhasil diekspor ke CSV!");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="w-6 h-6" />
            </span>
            Catatan Pemasukan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola seluruh sumber aliran kas masuk Anda. Saldo bertambah otomatis setiap kali disimpan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={filteredIncomes.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Tambah Pemasukan</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Pemasukan Bulan Ini
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatRupiah(monthIncome)}
          </p>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Akumulasi Keseluruhan Pemasukan
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {formatRupiah(totalIncome)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pemasukan / catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Kategori Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Kategori</option>
              {INCOME_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal Mulai */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Dari tanggal"
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Tanggal Selesai */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Sampai tanggal"
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Income List (Desktop Table & Mobile Cards) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        {filteredIncomes.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">
              Tidak Ada Catatan Pemasukan
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Belum ada data yang sesuai filter atau Anda belum menambahkan catatan pemasukan.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="pb-3 px-3">Tanggal</th>
                    <th className="pb-3 px-3">Kategori</th>
                    <th className="pb-3 px-3">Metode</th>
                    <th className="pb-3 px-3">Catatan</th>
                    <th className="pb-3 px-3 text-right">Nominal</th>
                    <th className="pb-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredIncomes.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                        {formatTanggalIndo(tx.date)}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                        {tx.category}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold capitalize">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 text-xs max-w-xs truncate">
                        {tx.note || "-"}
                      </td>
                      <td className="py-3.5 px-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                        +{formatRupiah(tx.amount)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(tx.id)}
                            title="Hapus"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredIncomes.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {tx.category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold capitalize">
                        {tx.paymentMethod}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatTanggalIndo(tx.date)} {tx.note ? `• ${tx.note}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      +{formatRupiah(tx.amount)}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(tx)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(tx.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType="income"
        editingTransaction={editingTx}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        title="Hapus Pemasukan Ini?"
        description="Saldo Anda akan berkurang otomatis sesuai dengan nominal pemasukan ini. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus Pemasukan"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
