"use client";

import React, { useState, useMemo } from "react";
import {
  History,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Edit2,
  Trash2,
  Download,
  Inbox,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { useToast } from "@/context/ToastContext";
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types";
import { formatRupiah, formatTanggalIndo, exportToCSV } from "@/lib/utils";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const ITEMS_PER_PAGE = 8;

export default function TransactionsPage() {
  const { transactions, deleteTransaction } = useFinance();
  const { showSuccess, showError } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  const allCategories = useMemo(() => {
    return Array.from(new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]));
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchSearch =
          tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (tx.note && tx.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
          tx.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());

        const matchType = selectedType === "all" || tx.type === selectedType;
        const matchCategory = selectedCategory === "all" || tx.category === selectedCategory;
        const matchStart = !startDate || tx.date >= startDate;
        const matchEnd = !endDate || tx.date <= endDate;

        return matchSearch && matchType && matchCategory && matchStart && matchEnd;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
  }, [transactions, searchQuery, selectedType, selectedCategory, startDate, endDate, sortOrder]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const res = await deleteTransaction(deletingId);
    if (res.success) {
      showSuccess("Transaksi berhasil dihapus.");
    } else {
      showError(res.error || "Gagal menghapus transaksi.");
    }
    setDeletingId(null);
  };

  const handleExportCSV = () => {
    const rows = filteredTransactions.map((tx) => ({
      ID: tx.id,
      Tanggal: tx.date,
      Jenis: tx.type === "income" ? "Pemasukan" : "Pengeluaran",
      Kategori: tx.category,
      Nominal: tx.amount,
      Metode: tx.paymentMethod,
      Catatan: tx.note || "",
    }));
    exportToCSV(`Seluruh_Transaksi_CuanKu_${Date.now()}.csv`, rows);
    showSuccess("Laporan transaksi berhasil diekspor ke format CSV!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <History className="w-6 h-6" />
            </span>
            Riwayat Seluruh Transaksi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Telusuri, filter, dan kelola semua mutasi keuangan pemasukan maupun pengeluaran.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredTransactions.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Laporan (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari transaksi atau catatan..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Jenis</option>
              <option value="income">+ Pemasukan</option>
              <option value="expense">− Pengeluaran</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Kategori</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Sort and Counter info */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Ditemukan <strong className="text-slate-900 dark:text-white">{filteredTransactions.length}</strong> transaksi
          </span>

          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Urutkan: {sortOrder === "desc" ? "Terbaru" : "Terlama"}</span>
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">
              Tidak Ada Transaksi yang Cocok
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Coba sesuaikan kata kunci pencarian atau reset filter tanggal dan kategori Anda.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="pb-3 px-3">Tanggal</th>
                    <th className="pb-3 px-3">Jenis</th>
                    <th className="pb-3 px-3">Kategori</th>
                    <th className="pb-3 px-3">Metode</th>
                    <th className="pb-3 px-3">Catatan</th>
                    <th className="pb-3 px-3 text-right">Nominal</th>
                    <th className="pb-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedList.map((tx) => {
                    const isIncome = tx.type === "income";
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                          {formatTanggalIndo(tx.date)}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isIncome
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                                : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
                            }`}
                          >
                            {isIncome ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                            {isIncome ? "Masuk" : "Keluar"}
                          </span>
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
                        <td
                          className={`py-3.5 px-3 text-right font-extrabold text-base ${
                            isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatRupiah(tx.amount)}
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
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedList.map((tx) => {
                const isIncome = tx.type === "income";
                return (
                  <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {tx.category}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isIncome
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600"
                              : "bg-rose-100 dark:bg-rose-950 text-rose-600"
                          }`}
                        >
                          {isIncome ? "Masuk" : "Keluar"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {formatTanggalIndo(tx.date)} {tx.note ? `• ${tx.note}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`font-black text-sm ${
                          isIncome
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatRupiah(tx.amount)}
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
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Halaman {currentPage} dari {totalPages}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingTransaction={editingTx}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        title="Hapus Transaksi Ini?"
        description="Saldo Anda akan disesuaikan otomatis setelah transaksi dihapus. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
